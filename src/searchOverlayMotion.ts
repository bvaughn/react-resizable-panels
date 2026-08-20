const OVERLAY = ".fixed.inset-0.backdrop-blur-md";

export function bindSearchOverlayMotion() {
  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  const observer = new MutationObserver((records) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    for (const record of records) {
      for (const node of record.removedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }

        const overlay = node.matches(OVERLAY)
          ? node
          : node.querySelector(OVERLAY);
        if (!(overlay instanceof HTMLElement)) {
          continue;
        }

        if ("docsSearchExit" in overlay.dataset) {
          continue;
        }

        const host = record.target;
        if (!(host instanceof HTMLElement)) {
          continue;
        }

        const clone = overlay.cloneNode(true);
        if (!(clone instanceof HTMLElement)) {
          continue;
        }

        clone.dataset.docsSearchExit = "";
        clone.style.pointerEvents = "none";
        host.append(clone);
        clone.addEventListener("animationend", () => clone.remove(), {
          once: true
        });
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });
}
