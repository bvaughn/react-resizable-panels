import "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericEventEmitter = EventEmitter<any>;

declare module "vitest" {
  interface Matchers {
    toDispatchEvents: (
      target: EventTarget | GenericEventEmitter,
      typeCounts: { [type: string]: number }
    ) => ReturnType;
    toLogError: (expectedError: string) => ReturnType;
  }
}
