// Measurements of tabsets and splits that have been removed aren't needed anymore
export function pruneRemovedNodes<Value>(
  sizes: { [nodeId: string]: Value },
  nodeIds: Set<string>
): { [nodeId: string]: Value } {
  const nodeIdsToRemove = Object.keys(sizes).filter(
    (nodeId) => !nodeIds.has(nodeId)
  );
  if (nodeIdsToRemove.length === 0) {
    return sizes;
  }

  const next = { ...sizes };
  for (const nodeId of nodeIdsToRemove) {
    delete next[nodeId];
  }

  return next;
}
