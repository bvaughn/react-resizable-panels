import { isExplicitId } from "./isExplicitId";

/**
 * Returns the `data-testid` attribute if it is an explicit id (a number or non-empty string),
 * otherwise the id prop if it is one, otherwise undefined.
 */
export function getTestId(
  attributes: object | undefined,
  idProp: number | string | undefined
): string | undefined {
  const testId = (attributes as { "data-testid"?: unknown } | undefined)?.[
    "data-testid"
  ];

  if (isExplicitId(testId)) {
    return `${testId}`;
  }

  return isExplicitId(idProp) ? `${idProp}` : undefined;
}
