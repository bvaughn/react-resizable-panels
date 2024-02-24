import {
  ChangeEvent,
  Component,
  ErrorInfo,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  assert,
} from "react-resizable-panels";
import {
  assertImperativePanelGroupHandle,
  assertImperativePanelHandle,
} from "../../../tests/utils/assert";
import Icon from "../../components/Icon";
import { urlPanelGroupToPanelGroup, urlToUrlData } from "../../utils/UrlData";
import DebugLog, { ImperativeDebugLogHandle } from "../examples/DebugLog";
import "./styles.css";
import styles from "./styles.module.css";
import { VisibleCursor } from "../../components/VisibleCursor";

// Special route that can be configured via URL parameters.

class ErrorBoundary extends Component<PropsWithChildren> {
  state = {
    didError: false,
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(error);
  }

  render() {
    return this.state.didError ? null : this.props.children;
  }
}

function EndToEndTesting() {
  const [urlData, setUrlData] = useState(() => {
    const url = new URL(
      typeof window !== undefined ? window.location.href : ""
    );

    return urlToUrlData(url);
  });

  const [showModal, setShowModal] = useState(false);
  const [panelId, setPanelId] = useState("");
  const [panelIds, setPanelIds] = useState<string[]>([]);
  const [panelGroupId, setPanelGroupId] = useState("");
  const [panelGroupIds, setPanelGroupIds] = useState<string[]>([]);
  const [size, setSize] = useState<number>(0);
  const [layoutString, setLayoutString] = useState("");

  const debugLogRef = useRef<ImperativeDebugLogHandle>(null);
  const idToRefMapRef = useRef<
    Map<string, ImperativePanelHandle | ImperativePanelGroupHandle>
  >(new Map());

  useLayoutEffect(() => {
    const populateDropDowns = () => {
      const panelElements = document.querySelectorAll("[data-panel-id]");
      const panelIds = Array.from(panelElements).map(
        (element) => element.getAttribute("data-panel-id")!
      );

      const firstPanelId = panelIds[0];
      assert(firstPanelId != null, "First panel id not found");

      setPanelIds(panelIds);
      setPanelId(firstPanelId);

      const panelGroupElements =
        document.querySelectorAll("[data-panel-group]");
      const panelGroupIds = Array.from(panelGroupElements).map(
        (element) => element.getAttribute("data-panel-group-id")!
      );

      const firstPanelGroupId = panelGroupIds[0];
      assert(firstPanelGroupId != null, "First PanelGroup id not found");

      setPanelGroupIds(panelGroupIds);
      setPanelGroupId(firstPanelGroupId);
    };

    window.addEventListener("popstate", (event) => {
      const url = new URL(
        typeof window !== undefined ? window.location.href : ""
      );

      setUrlData(urlToUrlData(url));

      populateDropDowns();
    });

    populateDropDowns();
  }, []);

  useLayoutEffect(() => {
    const calculatePanelSize = (panelElement: HTMLElement) => {
      if (panelElement.childElementCount > 0) {
        return; // Don't override nested groups
      }

      // Let layout effects fire first
      setTimeout(() => {
        const panelId = panelElement.getAttribute("data-panel-id");
        if (panelId != null) {
          const panel = idToRefMapRef.current.get(
            panelId
          ) as ImperativePanelHandle;
          if (panel != null) {
            const size = panel.getSize();

            panelElement.textContent = `${size.toFixed(1)}%`;
          }
        }
      }, 0);
    };

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        calculatePanelSize(record.target as HTMLElement);
      });
    });
    const resizeObserver = new ResizeObserver((records) => {
      records.forEach((record) => {
        calculatePanelSize(record.target as HTMLElement);
      });
    });

    const elements = document.querySelectorAll("[data-panel]");
    Array.from(elements).forEach((element) => {
      mutationObserver.observe(element, {
        attributes: true,
      });
      resizeObserver.observe(element);

      calculatePanelSize(element as HTMLElement);
    });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [urlData]);

  const children = urlData
    ? urlPanelGroupToPanelGroup(urlData, debugLogRef, idToRefMapRef)
    : null;

  const onLayoutInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setLayoutString(value.startsWith("[") ? value : `[${value}]`);
  };

  const onPanelIdSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value;
    setPanelId(value);
  };

  const onPanelGroupIdSelectChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.currentTarget.value;
    setPanelGroupId(value);
  };

  const onSizeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setSize(parseFloat(value));
  };

  const onCollapseButtonClick = () => {
    const idToRefMap = idToRefMapRef.current;
    const panel = idToRefMap.get(panelId);
    if (panel && assertImperativePanelHandle(panel)) {
      panel.collapse();
    }
  };

  const onExpandButtonClick = () => {
    const idToRefMap = idToRefMapRef.current;
    const panel = idToRefMap.get(panelId);
    if (panel && assertImperativePanelHandle(panel)) {
      panel.expand();
    }
  };

  const onResizeButtonClick = () => {
    const idToRefMap = idToRefMapRef.current;
    const panel = idToRefMap.get(panelId);
    if (panel && assertImperativePanelHandle(panel)) {
      panel.resize(size);
    }
  };

  const onSetLayoutButton = () => {
    const idToRefMap = idToRefMapRef.current;
    const panelGroup = idToRefMap.get(panelGroupId);
    if (panelGroup && assertImperativePanelGroupHandle(panelGroup)) {
      const trimmedLayoutString = layoutString.substring(
        1,
        layoutString.length - 1
      );
      const layout = trimmedLayoutString
        .split(",")
        .map((text) => parseFloat(text));
      panelGroup.setLayout(layout);
    }
  };

  const onToggleModalButtonClick = () => {
    setShowModal(!showModal);
  };

  return (
    <div className={styles.Container}>
      <div className={styles.FormRow}>
        <div className={styles.FormColumn}>
          <select
            className={styles.Input}
            id="panelIdSelect"
            onChange={onPanelIdSelectChange}
          >
            {panelIds.map((panelId) => (
              <option key={panelId} value={panelId}>
                {panelId}
              </option>
            ))}
          </select>
          <button
            id="collapseButton"
            onClick={onCollapseButtonClick}
            title="Collapse panel"
          >
            <Icon type="collapse" />
          </button>
          <button
            id="expandButton"
            onClick={onExpandButtonClick}
            title="Expand panel"
          >
            <Icon type="expand" />
          </button>
          <input
            className={styles.Input}
            id="sizeInput"
            onChange={onSizeInputChange}
            placeholder="Size (% or px)"
            type="text"
          />
          <button
            id="resizeButton"
            onClick={onResizeButtonClick}
            title="Resize panel"
          >
            <Icon type="resize" />
          </button>
          <div className={styles.Spacer} />
          <button
            id="toggleModalButton"
            onClick={onToggleModalButtonClick}
            title={showModal ? "Hide modal" : "Show modal"}
          >
            <Icon type="dialog" />
          </button>
          <div className={styles.Spacer} />
          <select
            className={styles.Input}
            id="panelGroupIdSelect"
            onChange={onPanelGroupIdSelectChange}
          >
            {panelGroupIds.map((panelGroupId) => (
              <option key={panelGroupId} value={panelGroupId}>
                {panelGroupId}
              </option>
            ))}
          </select>
          <input
            className={styles.Input}
            id="layoutInput"
            onChange={onLayoutInputChange}
            placeholder="Layout"
            type="string"
          />
          <button
            id="setLayoutButton"
            onClick={onSetLayoutButton}
            title="Set layout"
          >
            <Icon type="resize" />
          </button>
        </div>
      </div>
      <DebugLog apiRef={debugLogRef} />
      <div className={styles.Children}>{children}</div>
      {showModal && <Modal />}
    </div>
  );
}

function Modal() {
  return (
    <div className={styles.Modal} data-test-id="ModalBox">
      <p>Modal dialog</p>
      <p>Block clicks events</p>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <EndToEndTesting />
      <VisibleCursor />
    </ErrorBoundary>
  );
}
