export function assert(
  expectedCondition: boolean,
  message: string = "Assertion failed!"
): asserts expectedCondition {
  if (!expectedCondition) {
    console.error(message);

    throw Error(message);
  }
}
