import {
  Activity,
  useState,
  type PropsWithChildren,
  type ReactNode
} from "react";

export type DisplayModeToggleProps = PropsWithChildren<{
  defaultVisible?: boolean;
  mode: "activity" | "conditional" | "css";
}>;

export function DisplayModeToggle({
  children: childrenProp,
  defaultVisible = false,
  mode
}: DisplayModeToggleProps) {
  const [visible, setVisible] = useState(defaultVisible);

  let children: ReactNode = null;
  switch (mode) {
    case "activity": {
      children = (
        <Activity mode={visible ? "visible" : "hidden"}>
          {childrenProp}
        </Activity>
      );
      break;
    }
    case "css": {
      children = (
        <div
          style={{
            display: visible ? "block" : "none"
          }}
        >
          {childrenProp}
        </div>
      );
      break;
    }
    case "conditional": {
      children = visible ? childrenProp : null;
      break;
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setVisible(!visible);
        }}
      >
        toggle {mode} {visible ? "visible" : "hidden"}
        {" → "}
        {visible ? "hidden" : "visible"}
      </button>
      {children}
    </>
  );
}
