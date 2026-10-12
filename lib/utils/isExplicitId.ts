// Empty ids can't be targeted, but 0 can
export function isExplicitId(value: unknown): value is number | string {
  return (
    (typeof value === "number" || typeof value === "string") && value !== ""
  );
}
