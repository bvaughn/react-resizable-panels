import { createCache } from "suspense";

type Module = any;

export const importCache = createCache<[string], Module>({
  config: { immutable: true },
  debugLabel: "importCache",
  getKey: ([path]) => path,
  load: async ([path]) => {
    switch (path) {
      case "@codemirror/lang-css":
        return await import("@codemirror/lang-css");
      case "@codemirror/lang-html":
        return await import("@codemirror/lang-html");
      case "@codemirror/lang-javascript":
        return await import("@codemirror/lang-javascript");
      case "@codemirror/lang-markdown":
        return await import("@codemirror/lang-markdown");
      default:
        throw Error(`Unknown path: ${path}`);
    }
  },
});
