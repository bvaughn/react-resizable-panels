export function assert(
  expectedCondition: any,
  message: string = "Assertion failed!"
): asserts expectedCondition {
  if (!expectedCondition) {
    console.error(message);

    throw Error(message);
  }
}
