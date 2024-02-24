export function assert(
  expectedCondition: any,
  message: string
): asserts expectedCondition {
  if (!expectedCondition) {
    console.error(message);

    throw Error(message);
  }
}
