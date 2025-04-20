import { isBrowser } from "#is-browser";
import { useLayoutEffect as useLayoutEffectBrowser } from "react";

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffectBrowser : () => {};

export default useIsomorphicLayoutEffect;
