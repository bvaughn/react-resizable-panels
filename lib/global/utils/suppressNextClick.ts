/**
 * Prevents the "click" event that the browser dispatches after a pointer is released, if there is one.
 *
 * ℹ️ The click (if any) is dispatched immediately after "pointerup",
 * so the listener is removed after the current task to avoid blocking a later, unrelated click.
 */
export function suppressNextClick(ownerDocument: Document) {
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    remove();
  };

  const remove = () => {
    ownerDocument.removeEventListener("click", onClick, true);
  };

  ownerDocument.addEventListener("click", onClick, true);

  setTimeout(remove, 0);
}
