export function getStorageKey(id: string, panelIds: string[]): string {
  return `react-resizable-panels:${[id, ...panelIds].join(":")}`;
}
