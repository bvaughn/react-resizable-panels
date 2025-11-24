// Constants used for memoization
export const EMPTY_ARRAY: unknown[] = [];
export const EMPTY_DOM_RECT: DOMRectReadOnly = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  toJSON: () => {},
  top: 0,
  width: 0,
  x: 0,
  y: 0
};
export const EMPTY_OBJECT = {};
export const EMPTY_POINT = { x: 0, y: 0 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IDENTITY_FUNCTION = (value: any) => value;
export const NOOP_FUNCTION = () => {};

// Cursor flags
export const CURSOR_FLAG_HORIZONTAL_MIN = 0b0001;
export const CURSOR_FLAG_HORIZONTAL_MAX = 0b0010;
export const CURSOR_FLAG_VERTICAL_MIN = 0b0100;
export const CURSOR_FLAG_VERTICAL_MAX = 0b1000;

// Misc. shared values
export const DEFAULT_POINTER_PRECISION = {
  coarse: 10,
  precise: 5
};
