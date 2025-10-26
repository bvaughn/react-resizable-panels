import { createElement } from "react";
import { DEFAULT_STORAGE_KEY_PREFIX } from "./utils/serialization";
import { DATA_ATTRIBUTES } from "./constants";
import { panelSizeCssVar } from "./utils/computePanelFlexBoxStyle";
import { MINIFIED_PERSIST } from "./scripts/persist.minified";
import { useIsSSR } from "./hooks/useIsSSR";

export interface PersistScriptProps {
  autoSaveId: string | null;
  storageKeyPrefix?: string;
  nonce?: string;
}

export const PanelPersistScript = ({
  nonce,
  autoSaveId,
  storageKeyPrefix = DEFAULT_STORAGE_KEY_PREFIX,
}: PersistScriptProps) => {
  const isSSR = useIsSSR();

  if (!isSSR) {
    return null;
  }

  const scriptArgs = JSON.stringify([
    autoSaveId,
    storageKeyPrefix,
    DATA_ATTRIBUTES.autoSaveId,
  ]).slice(1, -1);

  return createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `(${MINIFIED_PERSIST})(${scriptArgs})`,
    },
    nonce,
  });
};
