import { Gridline } from "../components/Gridline";
import { Children, isValidElement, type ReactNode } from "react";

export function findSeparatorsInChildren(
  children: ReactNode,
  gutters: { column: boolean; row: boolean }
) {
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Gridline) {
        const { type } = child.props as { type?: unknown };
        if (type === "column") {
          gutters.column = true;
        } else if (type === "row") {
          gutters.row = true;
        }
      } else if (
        // Fragments
        typeof child.type === "symbol" &&
        child.props !== null &&
        typeof child.props === "object" &&
        "children" in child.props
      ) {
        findSeparatorsInChildren(child.props.children as ReactNode, gutters);
      }
    }
  });
}
