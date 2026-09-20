function replayContentFade() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const el = document.querySelector("[data-main-scrollable]");
  if (!(el instanceof HTMLElement)) {
    return;
  }

  el.classList.remove("docs-content-fade");
  void el.offsetWidth;
  el.classList.add("docs-content-fade");
}

function wrapHistory(
  method: "pushState" | "replaceState"
): typeof history.pushState {
  const original = history[method];
  return function (this: History, ...args: Parameters<typeof history.pushState>) {
    const prevPath = location.pathname;
    const result = original.apply(this, args);
    if (location.pathname !== prevPath) {
      requestAnimationFrame(() => requestAnimationFrame(replayContentFade));
    }
    return result;
  };
}

export function bindDocsContentMotion() {
  history.pushState = wrapHistory("pushState");
  history.replaceState = wrapHistory("replaceState");
  window.addEventListener("popstate", () => {
    requestAnimationFrame(() => requestAnimationFrame(replayContentFade));
  });
}
