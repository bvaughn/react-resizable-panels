import { isHTMLElement } from "../../shared/utils/isHTMLElement";

/**
 * Copies a document's stylesheets into another document (e.g. a popup window's), and copies stylesheets added to its head afterward.
 *
 * ℹ️ Linked stylesheets are copied as links, so the URLs within them resolve the same way.
 * The rules of other stylesheets (`<style>` elements, and adopted stylesheets) are copied as text,
 * including rules inserted with `CSSStyleSheet.insertRule` (which aren't in the elements' text).
 *
 * ℹ️ Stylesheets are only copied, not kept in sync: removing or editing a stylesheet in the source afterward isn't mirrored.
 * Rebuilt `<style>` elements get the source element's CSP nonce.
 *
 * @returns A function that stops copying stylesheets added afterward
 */
export function copyStyleSheets(source: Document, target: Document) {
  const append = (node: Node) => target.head.append(node);

  // Stylesheet elements are found in the document (rather than its styleSheets list),
  // which doesn't include linked stylesheets that are still loading
  for (const element of Array.from(
    source.querySelectorAll('link[rel~="stylesheet"], style')
  )) {
    const text =
      element.nodeName === "STYLE"
        ? readRules((element as HTMLStyleElement).sheet)
        : undefined;
    append(
      text !== undefined
        ? createStyle(
            target,
            text,
            element.getAttribute("media") ?? "",
            (element as HTMLStyleElement).nonce
          )
        : target.importNode(element, true)
    );
  }

  // Adopted stylesheets have no nonce of their own, so a nonce used by the document's other elements is used (styles' first)
  const findNonce = (selector: string) =>
    Array.from(source.querySelectorAll<HTMLElement>(selector))
      .map((element) => element.nonce)
      .find(Boolean);
  const nonce =
    findNonce("style, link[rel~='stylesheet']") ?? findNonce("script");
  for (const sheet of source.adoptedStyleSheets ?? []) {
    const text = readRules(sheet);
    if (text !== undefined) {
      append(createStyle(target, text, sheet.media?.mediaText ?? "", nonce));
    }
  }

  const MutationObserver = source.defaultView?.MutationObserver;
  if (!MutationObserver) {
    return () => {};
  }

  // Stylesheets added later (e.g. by code that's loaded lazily) are copied as elements, since their rules may not be loaded yet
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (
          isHTMLElement(node) &&
          (node.nodeName === "STYLE" ||
            (node.nodeName === "LINK" &&
              /(^|\s)stylesheet(\s|$)/i.test(node.getAttribute("rel") ?? "")))
        ) {
          append(target.importNode(node, true));
        }
      }
    }
  });
  observer.observe(source.head, { childList: true });

  return () => observer.disconnect();
}

// The rules of a stylesheet from another origin can't be read
function readRules(sheet: CSSStyleSheet | null): string | undefined {
  if (!sheet) {
    return undefined;
  }

  try {
    return Array.from(sheet.cssRules, (rule) => rule.cssText).join("\n");
  } catch {
    return undefined;
  }
}

function createStyle(
  target: Document,
  text: string,
  media: string,
  nonce?: string
) {
  const style = target.createElement("style");
  if (nonce) {
    style.nonce = nonce;
  }
  if (media) {
    style.media = media;
  }
  style.textContent = text;

  return style;
}
