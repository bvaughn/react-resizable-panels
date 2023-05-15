export function isServerRendering(): boolean {
  try {
    return typeof window === undefined;
  } catch (error) {}

  return true;
}
