import type { HitRegion } from "../global/dom/calculateHitRegions";
import { assert } from "../utils/assert";
import type { MutableGroup } from "./MutableGroup";
import type { GroupLayout } from "./types";

export class GroupLayoutTransaction {
  readonly group: MutableGroup;
  readonly hitRegion: HitRegion | undefined;
  readonly initialLayout: GroupLayout;

  #isPending: boolean = true;
  #pendingLayout: GroupLayout;
  #updateGroup: () => void;

  constructor(
    group: MutableGroup,
    updateGroup: () => void,
    hitRegion?: HitRegion | undefined
  ) {
    this.group = group;
    this.hitRegion = hitRegion;
    this.initialLayout = group.layout;
    this.#pendingLayout = group.layout;
    this.#updateGroup = updateGroup;
  }

  /**
   * The transaction is still pending.
   */
  get isPending() {
    return this.#isPending;
  }

  /**
   * The most recent layout (if a valid update has been proposed).
   */
  get pendingLayout() {
    return this.#pendingLayout;
  }

  /**
   * Complete the transition and return the final layout.
   */
  endTransaction() {
    assert(this.#isPending === true, "Transaction already ended");

    this.#isPending = false;
    this.#updateGroup();

    return this;
  }

  /**
   * Propose an updated layout.
   */
  proposedUpdate(proposedLayout: GroupLayout) {
    assert(this.#isPending, "Transaction already ended");

    this.#pendingLayout = proposedLayout;
    this.#updateGroup();

    return this;
  }
}
