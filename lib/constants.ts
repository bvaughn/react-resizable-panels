// Constants used for memoization
export const EMPTY_ARRAY: unknown[] = [];
export const EMPTY_DOM_RECT = new DOMRect(0, 0, 0, 0);
export const EMPTY_OBJECT = {};
export const EMPTY_POINT = { x: 0, y: 0 };
export const NOOP_FUNCTION = () => {};

// Cursor flags
export const EXCEEDED_HORIZONTAL_MIN = 0b0001;
export const EXCEEDED_HORIZONTAL_MAX = 0b0010;
export const EXCEEDED_VERTICAL_MIN = 0b0100;
export const EXCEEDED_VERTICAL_MAX = 0b1000;

// Misc. shared values
export const DEFAULT_POINTER_PRECISION = {
  coarse: 10,
  precise: 5
};
