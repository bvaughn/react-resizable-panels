import { useEffect, useRef } from "react";

// <begin>

import { useParentTabState } from "react-resizable-panels";

function Editor() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const isVisible = useParentTabState()?.isVisible;

  useEffect(() => {
    if (isVisible) {
      ref.current?.focus();
    }
  }, [isVisible]);

  return <textarea ref={ref} />;
}

// <end>

export { Editor };
