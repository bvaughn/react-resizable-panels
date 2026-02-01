export function getOwnerDocument(value: unknown): Document {
  if (typeof value === "object" && value !== null && "nodeType" in value) {
    switch (value.nodeType) {
      case Node.DOCUMENT_NODE: {
        return value as Document;
      }
      case Node.ELEMENT_NODE: {
        return (value as HTMLElement).ownerDocument;
      }
      case Node.TEXT_NODE: {
        return (value as Text).ownerDocument;
      }
    }
  }

  throw Error("Invalid target");
}
