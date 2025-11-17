export function getPanelSizeCssPropertyName(panelId: string) {
  const escaped = panelId.replace(/[^a-zA-Z0-9\-_]/g, "");

  return `--react-resizable-panels--panel--flex-grow--${escaped}`;
}
