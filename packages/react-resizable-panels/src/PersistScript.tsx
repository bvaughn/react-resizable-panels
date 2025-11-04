import { createElement } from "react";
import { DEFAULT_STORAGE_KEY_PREFIX } from "./utils/serialization";
import { DATA_ATTRIBUTES, PANEL_SIZE_CSS_VARIABLE_TEMPLATE } from "./constants";
import { MINIFIED_PERSIST } from "./scripts/persist.minified";
import { useIsSSR } from "./hooks/useIsSSR";

export interface PersistScriptProps {
  autoSaveId: string | null;
  storageKeyPrefix?: string;
  nonce?: string;
}

export const PersistScript = ({
  nonce,
  autoSaveId,
  storageKeyPrefix = DEFAULT_STORAGE_KEY_PREFIX,
}: PersistScriptProps) => {
  const isSSR = useIsSSR();

  if (!isSSR) {
    return null;
  }

  const scriptArgs = JSON.stringify([
    storageKeyPrefix,
    PANEL_SIZE_CSS_VARIABLE_TEMPLATE,
  ]).slice(1, -1);

  return createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `(${MINIFIED_PERSIST})(${scriptArgs})`,
    },
    nonce,
  });
};
