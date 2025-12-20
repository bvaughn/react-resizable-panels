export function objectsEqual(a: object, b: object) {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    if (a[key as keyof typeof a] !== b[key as keyof typeof b]) {
      return false;
    }
  }

  return true;
}
