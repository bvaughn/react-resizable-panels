import { isBrowser } from "#is-browser";
import { useLayoutEffect } from "../vendor/react";

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : () => {};

export default useIsomorphicLayoutEffect;
