import { ImperativePanelGroupHandle } from "react-resizable-panels";
import { ImperativePanelHandle } from "react-resizable-panels/src";

export function assert(
  expectedCondition: boolean,
  message: string = "Assertion failed!"
): asserts expectedCondition {
  if (!expectedCondition) {
    console.error(message);

    throw Error(message);
  }
}

export function assertImperativePanelHandle(
  value: any
): value is ImperativePanelHandle {
  assert(
    isImperativePanelHandle(value),
    "Value is not an ImperativePanelHandle"
  );
  return true;
}

export function assertImperativePanelGroupHandle(
  value: any
): value is ImperativePanelGroupHandle {
  assert(
    isImperativePanelGroupHandle(value),
    "Value is not an ImperativePanelGroupHandle"
  );
  return true;
}

export function isImperativePanelHandle(
  value: any
): value is ImperativePanelHandle {
  return (
    value != null &&
    typeof value === "object" &&
    typeof value.collapse === "function" &&
    typeof value.expand === "function" &&
    typeof value.getCollapsed === "function" &&
    typeof value.getSize === "function" &&
    typeof value.resize === "function"
  );
}

export function isImperativePanelGroupHandle(
  value: any
): value is ImperativePanelGroupHandle {
  return (
    value != null &&
    typeof value === "object" &&
    typeof value.getLayout === "function" &&
    typeof value.setLayout === "function"
  );
}
