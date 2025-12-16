let cached: boolean | undefined = undefined;

export function isCoarsePointer(): boolean {
  if (cached === undefined) {
    if (typeof matchMedia === "function") {
      cached = !!matchMedia("(pointer:coarse)").matches;
    } else {
      cached = false;
    }
  }

  return cached;
}
