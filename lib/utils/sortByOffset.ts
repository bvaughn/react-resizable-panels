export function sortByOffset<Type extends { offset: number; size: number }>(
  toSort: Type[]
): Type[] {
  return toSort.sort((a: Type, b: Type) => {
    const delta = a.offset - b.offset;
    if (delta !== 0) {
      return delta;
    }
    return a.size - b.size;
  });
}
