import { useCallback, useState } from "../vendor/react";

export function useForceUpdate() {
  const [_, setCount] = useState(0);

  return useCallback(() => setCount((prevCount) => prevCount + 1), []);
}
