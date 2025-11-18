export function debounce(fn: () => void, durationMs?: number): () => void;
export function debounce<Args>(
  fn: (args: Args) => void,
  durationMs?: number
): (args: Args) => void;
export function debounce<Args>(
  fn: (args: Args) => void,
  durationMs: number = 10
): (args: Args) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (args: Args) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(args);
    }, durationMs);
  };
}
