import type {
  Orientation,
  ResizeTargetMinimumSize
} from "../components/group/types";
import type { HitRegion } from "../global/dom/calculateHitRegions";
import { Rect } from "../types";
import { assert } from "../utils/assert";
import { calculateDefaultLayout } from "../utils/calculateDefaultLayout";
import { calculateSeparatorAriaAttributes } from "../utils/calculateSeparatorAriaAttributes";
import { EventEmitter } from "../utils/EventEmitter";
import { layoutsEqual } from "../utils/layoutsEqual";
import { scalePanelDimensions } from "../utils/scalePanelDimensions";
import { sortByOffset } from "../utils/sortByOffset";
import { validateLayoutKeys } from "../utils/validateLayoutKeys";
import { validatePanelGroupLayout } from "../utils/validatePanelGroupLayout";
import { GroupLayoutTransaction } from "./GroupLayoutTransaction";
import type { MutablePanel } from "./MutablePanel";
import type { MutableSeparator } from "./MutableSeparator";
import {
  type GroupAriaAttributes,
  type GroupHTMLElementInterface,
  type GroupLayout,
  type SeparatorAriaAttributes,
  type SeparatorState
} from "./types";

export class MutableGroup extends EventEmitter<{
  childrenChange: undefined;
  groupSizeChange: number;
  layoutChange: GroupLayout;
  layoutChanged: GroupLayout;
  separatorStatesChange: [Map<MutableSeparator, SeparatorState>];
  transactionEnded: void;
}> {
  ariaAttributes: GroupAriaAttributes = {};
  children: (MutablePanel | MutableSeparator)[] = [];
  elementInterface: GroupHTMLElementInterface;
  groupSize: number = 0;
  #defaultLayout: GroupLayout | undefined;
  disabled = false;
  disableCursor: boolean = false;
  readonly id: string;
  #layout: GroupLayout = {};
  #layoutTransaction: GroupLayoutTransaction | null = null;
  readonly orientation: Orientation;
  panels: MutablePanel[] = [];
  #pendingLayout: GroupLayout | null = {};
  #removeResizeListener: (() => void) | null = null;
  resizeTargetMinimumSize: ResizeTargetMinimumSize;
  separators: MutableSeparator[] = [];
  #separatorStates: Map<MutableSeparator, SeparatorState> = new Map();
  #timeout: NodeJS.Timeout | null = null;

  constructor({
    defaultLayout,
    elementInterface,
    id,
    orientation = "horizontal",
    resizeTargetMinimumSize
  }: {
    defaultLayout: GroupLayout | undefined;
    elementInterface: GroupHTMLElementInterface;
    id: string;
    orientation: Orientation | undefined;
    resizeTargetMinimumSize: ResizeTargetMinimumSize;
  }) {
    super();

    this.#defaultLayout = defaultLayout;
    this.elementInterface = elementInterface;
    this.id = id;
    this.#layout = defaultLayout ?? {};
    this.orientation = orientation;
    this.resizeTargetMinimumSize = resizeTargetMinimumSize;

    this.#scheduleLayoutValidation();
  }

  get separatorStates() {
    return this.#separatorStates;
  }

  get isLayoutTransactionPending(): boolean {
    return this.#layoutTransaction?.isPending === true;
  }

  get layout() {
    return this.#layout;
  }

  addPanels(...panels: MutablePanel[]) {
    let didChange = false;

    panels.forEach((panel) => {
      let didMatch = false;

      this.panels.forEach((current) => {
        if (current === panel) {
          didMatch = true;
        } else if (current.id === panel.id) {
          throw new Error(
            `Panel ids must be unique; id "${current.id}" was used more than once`
          );
        }
      });

      if (!didMatch) {
        didChange = true;

        panel.addListener("constraintsChange", this.#onPanelConstraintsChange);

        // Pre-sort by DOM position
        this.panels.push(panel);
        this.panels = sortByOffset(this.panels);

        this.#scheduleLayoutValidation();
      }
    });

    if (didChange) {
      this.emit("childrenChange", undefined);
    }

    return () => {
      this.removePanels(...panels);
    };
  }

  addSeparators(...separators: MutableSeparator[]) {
    let didChange = false;

    separators.forEach((separator) => {
      let didMatch = false;

      this.separators.forEach((current) => {
        if (current === separator) {
          didMatch = true;
        } else if (current.id === separator.id) {
          throw new Error(
            `Separator ids must be unique; id "${current.id}" was used more than once`
          );
        }
      });

      if (!didMatch) {
        didChange = true;

        // Pre-sort by DOM position
        this.separators.push(separator);
        this.separators = sortByOffset(this.separators);
        this.#separatorStates.set(separator, "default");

        this.#scheduleLayoutValidation();
      }
    });

    if (didChange) {
      this.emit("childrenChange", undefined);
    }

    return () => {
      this.removeSeparators(...separators);
    };
  }

  /**
   * (Re)validate the current layout if it has been scheduled.
   *
   * This method should be called during the layout effects cycle.
   * It is used to batch layout updates scheduled by child Panels or Separators.
   */
  flushPendingValidation = () => {
    if (this.#timeout !== null) {
      clearTimeout(this.#timeout);

      this.#timeout = null;
    }

    if (this.#pendingLayout !== null) {
      this.#validateLayout();
    }
  };

  getAriaAttributes(separator: MutableSeparator): SeparatorAriaAttributes {
    let nearestPanel: MutablePanel | undefined = undefined;
    for (const panel of this.panels) {
      if (panel.offset > separator.offset) {
        break;
      }
      nearestPanel = panel;
    }

    assert(
      nearestPanel !== undefined,
      `Could not find nearest Panel for Separator: ${separator.id}`
    );

    const ariaAttributes = this.ariaAttributes[nearestPanel.id];

    return ariaAttributes ?? {};
  }

  removePanels(...panels: MutablePanel[]) {
    let didChange = false;

    panels.forEach((panel) => {
      panel.removeListener("constraintsChange", this.#onPanelConstraintsChange);

      const index = this.panels.indexOf(panel);
      if (index >= 0) {
        this.panels.splice(index, 1);

        this.#scheduleLayoutValidation();

        didChange = true;
      }
    });

    if (didChange) {
      this.emit("childrenChange", undefined);
    }
  }

  removeSeparators(...separators: MutableSeparator[]) {
    let didChange = false;

    separators.forEach((separator) => {
      const index = this.separators.indexOf(separator);
      if (index >= 0) {
        this.separators.splice(index, 1);
        this.#separatorStates.delete(separator);

        this.#scheduleLayoutValidation();

        didChange = true;
      }
    });

    if (didChange) {
      this.emit("childrenChange", undefined);
    }
  }

  startLayoutTransaction(hitRegion?: HitRegion | undefined) {
    assert(this.disabled === false, "Group disabled");
    assert(this.#layoutTransaction === null, "Transaction already started");

    this.#layoutTransaction = new GroupLayoutTransaction(
      this,
      this.#onTransactionUpdate,
      hitRegion
    );

    return this.#layoutTransaction;
  }

  mount() {
    this.#removeResizeListener = this.elementInterface.onResize(
      this.#onElementResize
    );

    this.#onElementResize(this.elementInterface.getElementRect());
  }

  unmount() {
    if (this.#timeout !== null) {
      clearTimeout(this.#timeout);
    }

    if (this.#removeResizeListener) {
      this.#removeResizeListener();
      this.#removeResizeListener = null;
    }
  }

  updateMutableValues({
    disabled,
    disableCursor
  }: {
    disabled: boolean;
    disableCursor: boolean;
  }) {
    this.disabled = disabled;
    this.disableCursor = disableCursor;
  }

  updateSeparatorState(separator: MutableSeparator, nextState: SeparatorState) {
    const prevState = this.#separatorStates.get(separator);
    if (prevState !== nextState) {
      this.#separatorStates.set(separator, nextState);

      this.emit("separatorStatesChange", [this.#separatorStates]);
    }
  }

  #onElementResize = (rect: Rect) => {
    const layoutWasDeferred = this.groupSize === 0;

    const groupSize =
      this.orientation === "horizontal" ? rect.width : rect.height;
    if (this.groupSize !== groupSize) {
      this.groupSize = groupSize;
      this.emit("groupSizeChange", groupSize);
    }

    if (
      layoutWasDeferred ||
      this.panels.some((panel) => panel.canBeInvalidateByGroupDimensions)
    ) {
      this.#scheduleLayoutValidation();
    }
  };

  #onPanelConstraintsChange = () => {
    this.#scheduleLayoutValidation();
  };

  #onTransactionUpdate = () => {
    assert(this.#layoutTransaction !== null, "No transaction active");

    const { initialLayout, isPending, pendingLayout } = this.#layoutTransaction;

    if (!layoutsEqual(this.#layout, pendingLayout)) {
      this.#scheduleLayoutValidation(pendingLayout);
      this.#validateLayout();
    }

    if (!isPending) {
      this.#layoutTransaction = null;

      if (!layoutsEqual(initialLayout, pendingLayout)) {
        this.emit("layoutChanged", this.#layout);
      }

      this.emit("transactionEnded", undefined);
    }
  };

  #scheduleLayoutValidation(
    pendingLayout: GroupLayout | undefined = undefined
  ) {
    this.#pendingLayout = pendingLayout ?? this.#layout;
    if (this.#timeout === null) {
      this.#timeout = setTimeout(this.flushPendingValidation, 0);
    }
  }

  #validateLayout() {
    if (this.groupSize === 0) {
      // This is an indicator of being rendered within a hidden subtree;
      // the group can't meaningfully validate Panel constraints in this scenario
      this.#pendingLayout = null;
      // this.#layout = {};
      return;
    }

    let pendingLayout = this.#pendingLayout;
    assert(pendingLayout !== null, "Validation triggered unexpectedly");

    this.#pendingLayout = null;

    const isPendingLayoutEmpty = Object.keys(pendingLayout).length === 0;

    if (this.panels.length === 0) {
      if (!isPendingLayoutEmpty) {
        this.#layout = {};

        this.emit("layoutChange", this.#layout);

        if (this.#layoutTransaction === null) {
          this.emit("layoutChanged", this.#layout);
        }
      }

      return;
    }

    try {
      let didChange = false;

      // TODO Cache scaled constraints so we don't have to recompute them as often?
      const scaledConstraints = scalePanelDimensions({
        groupSize: this.groupSize,
        panels: this.panels
      });

      if (isPendingLayoutEmpty) {
        pendingLayout = calculateDefaultLayout(scaledConstraints);
      }

      // Ignore invalid layouts (when keys mismatch)
      // See github.com/bvaughn/react-resizable-panels/pull/540
      if (!validateLayoutKeys(this.panels, pendingLayout)) {
        if (Object.keys(this.#layout).length === 0) {
          pendingLayout = calculateDefaultLayout(scaledConstraints);
        } else {
          if (
            this.#defaultLayout !== undefined &&
            this.#defaultLayout !== pendingLayout
          ) {
            pendingLayout = this.#defaultLayout;
          } else {
            pendingLayout = calculateDefaultLayout(scaledConstraints);
          }
        }
      }

      const nextLayout = validatePanelGroupLayout({
        layout: pendingLayout,
        panelConstraints: scaledConstraints
      });

      if (!layoutsEqual(this.#layout, nextLayout)) {
        this.#layout = nextLayout;

        this.ariaAttributes = {};

        this.panels.forEach((panel, panelIndex) => {
          if (panelIndex >= this.panels.length - 1) {
            // The last Panel can't have a Separator
            return;
          }

          this.ariaAttributes[panel.id] = calculateSeparatorAriaAttributes({
            layout: nextLayout,
            panelConstraints: scaledConstraints,
            panelId: panel.id,
            panelIndex
          });
        });

        didChange = true;
      }

      if (didChange) {
        this.emit("layoutChange", this.layout);

        if (this.#layoutTransaction === null) {
          this.emit("layoutChanged", this.#layout);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
