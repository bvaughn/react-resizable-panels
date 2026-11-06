const TRANSPARENT_GIF =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// Created ahead of time (and reused), since an image that hasn't loaded yet may not be used as a drag image
const images = new WeakMap<Document, HTMLImageElement>();

/**
 * A transparent image, used to hide the browser's image of a dragged element (so that workspaces can show their own drag previews instead).
 */
export function getEmptyDragImage(ownerDocument: Document) {
  let image = images.get(ownerDocument);
  if (!image) {
    image = ownerDocument.createElement("img");
    image.src = TRANSPARENT_GIF;
    images.set(ownerDocument, image);
  }

  return image;
}
