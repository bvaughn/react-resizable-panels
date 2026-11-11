/**
 * The drop effect for a drag from outside of any workspace (see the acceptExternalDrop prop):
 * one that the drag's source allows (browsers reject drops with other effects), preferring "copy", since the source keeps what was dragged.
 * Returns `undefined` if the source doesn't allow any effect.
 */
export function getExternalDropEffect(
  effectAllowed: string
): "copy" | "link" | "move" | undefined {
  switch (effectAllowed) {
    case "all":
    case "copy":
    case "copyLink":
    case "copyMove":
    case "uninitialized": {
      return "copy";
    }
    case "linkMove":
    case "move": {
      return "move";
    }
    case "link": {
      return "link";
    }
    default: {
      return undefined;
    }
  }
}
