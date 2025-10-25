import { useDeferredValue, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const returnFalse = () => false;
const trueOnServerOrHydration = () => true;

export function useIsSSR() {
  const isSSRSync = useSyncExternalStore(
    emptySubscribe,
    returnFalse,
    trueOnServerOrHydration
  );
  return useDeferredValue(isSSRSync);
}
