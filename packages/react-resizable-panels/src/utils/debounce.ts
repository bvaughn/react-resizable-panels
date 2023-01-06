export default function debounce<T extends Function>(
  callback: T,
  durationMs: number = 10
) {
  let timeoutId: NodeJS.Timeout | null = null;

  let callable = (...args: any) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, durationMs);
  };

  return callable as unknown as T;
}
