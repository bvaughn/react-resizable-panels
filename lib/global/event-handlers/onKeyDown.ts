import { assert } from "../../utils/assert";

export function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    return;
  }

  console.log("onKeyDown:", event.key);

  switch (event.key) {
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "End":
    case "Home": {
      event.preventDefault();

      // TODO
      break;
    }
    case "F6": {
      event.preventDefault();

      const groupElement = (event.currentTarget as HTMLElement).parentElement;
      assert(groupElement, "Group element parent not found");

      const separatorElements =
        groupElement.querySelectorAll('[role="separator"]');

      const index = Array.from(separatorElements).findIndex(
        (current) => current === event.currentTarget
      );
      assert(index !== null, "Index not found");

      const nextIndex = event.shiftKey
        ? index > 0
          ? index - 1
          : separatorElements.length - 1
        : index + 1 < separatorElements.length
          ? index + 1
          : 0;

      const separatorElement = separatorElements[nextIndex] as HTMLElement;
      separatorElement.focus();
      break;
    }
  }
}
