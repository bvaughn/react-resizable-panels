// This module exists to work around Webpack issue https://github.com/webpack/webpack/issues/14814
// and limitations with ParcelJS parsing of the useId workaround (used below).
// For the time being, all react-resizable-panels must import "react" with the "* as React" syntax.
// To avoid mistakes, we use the ESLint "no-restricted-imports" to prevent "react" imports except in this file.
// See https://github.com/bvaughn/react-resizable-panels/issues/118

// eslint-disable-next-line no-restricted-imports
import * as React from "react";

// eslint-disable-next-line no-restricted-imports
import type {
  CSSProperties,
  ElementType,
  ForwardedRef,
  HTMLAttributes,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  RefObject,
  TouchEvent,
} from "react";

const {
  createElement,
  createContext,
  createRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} = React;

// `toString()` prevents bundlers from trying to `import { useId } from 'react'`
const useId = (React as any)["useId".toString()] as () => string;

export {
  createElement,
  createContext,
  createRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
};

export type {
  CSSProperties,
  ElementType,
  ForwardedRef,
  HTMLAttributes,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  RefObject,
  TouchEvent,
};
