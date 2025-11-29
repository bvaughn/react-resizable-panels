export function getPanelSizeCssPropertyName(groupId: string, panelId: string) {
  const groupIdEscaped = groupId.replace(/[^a-zA-Z0-9\-_]/g, "");
  const panelIdEscaped = panelId.replace(/[^a-zA-Z0-9\-_]/g, "");

  return `--react-resizable-panels--${groupIdEscaped}--${panelIdEscaped}`;
}
