import { createCache } from "suspense";

type Module = any;

export const {
  fetchAsync: fetchModuleAsync,
  fetchSuspense: fetchModuleSuspense,
} = createCache<[string], Module>(
  (path: string) => path,
  async (path: string) => {
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
  }
);
