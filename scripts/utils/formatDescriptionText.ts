export function formatDescriptionText(text: string) {
  return text
    .replaceAll("\n- ", "<br/>• ")
    .replaceAll("\n\n", "<br/><br/>")
    .replaceAll(/_([^_]+)_/g, "<em>$1</em>")
    .replaceAll(/`([^`]+)`/g, "<code>$1</code>");
}
