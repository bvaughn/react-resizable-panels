import { useLayoutEffect, useState, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";

export function PopupWindow({
  children,
  className,
  height = 500,
  width = 500
}: PropsWithChildren<{
  className?: string | undefined;
  height?: number | undefined;
  width?: number | undefined;
}>) {
  const [open, setOpen] = useState(false);

  const [container] = useState(() => {
    const div = document.createElement("div");
    if (className) {
      div.classList.add(...className.split(" "));
    }
    return div;
  });

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const popup = window.open(
      "",
      "",
      `width=${width},height=${height},left=0,top=0`
    );
    if (popup) {
      const styleSheet = popup.document.createElement("style");
      for (const currentStyleSheet of document.styleSheets) {
        for (const currentCssRule of currentStyleSheet.cssRules) {
          styleSheet.textContent += `${currentCssRule.cssText}\n`;
        }
      }

      popup.document.head.appendChild(styleSheet);
      popup.document.body.appendChild(container);

      const onBeforeUnload = () => {
        popup.close();
      };

      window.addEventListener("beforeunload", onBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", onBeforeUnload);

        popup.close();
      };
    }
  }, [container, height, open, width]);

  return (
    <>
      {open && createPortal(children, container)}
      <button onClick={() => setOpen(!open)}>{open ? "close" : "open"}</button>
    </>
  );
}
