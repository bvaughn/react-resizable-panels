import { afterEach, describe, expect, test } from "vitest";
import { copyStyleSheets } from "./copyStyleSheets";

describe("copyStyleSheets", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  test("copies rules (including inserted ones) as text, and links as links", () => {
    const style = document.createElement("style");
    style.textContent = ".static { color: blue; }";
    document.head.append(style);
    style.sheet!.insertRule(".inserted { color: red; }");

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://example.com/styles.css";
    document.head.append(link);

    const target = document.implementation.createHTMLDocument("target");
    const stop = copyStyleSheets(document, target);

    const copiedStyle = target.head.querySelector("style");
    expect(copiedStyle?.textContent).toContain(".static");
    expect(copiedStyle?.textContent).toContain(".inserted");
    expect(target.head.querySelector("link")?.getAttribute("href")).toBe(
      "https://example.com/styles.css"
    );

    stop();
  });

  test("copies stylesheets added to the head afterward, until stopped", async () => {
    const target = document.implementation.createHTMLDocument("target");
    const stop = copyStyleSheets(document, target);

    const style = document.createElement("style");
    style.textContent = ".later { color: green; }";
    document.head.append(style);
    document.head.append(document.createElement("div"));
    await Promise.resolve();
    expect(target.head.querySelectorAll("style")).toHaveLength(1);
    expect(target.head.textContent).toContain(".later");

    stop();
    const ignored = document.createElement("style");
    document.head.append(ignored);
    await Promise.resolve();
    expect(target.head.querySelectorAll("style")).toHaveLength(1);
  });

  test("copies the nonce of style elements (CSP)", async () => {
    const style = document.createElement("style");
    style.nonce = "abc123";
    style.textContent = ".nonced { color: blue; }";
    document.head.append(style);

    const target = document.implementation.createHTMLDocument("target");
    const stop = copyStyleSheets(document, target);
    expect(target.head.querySelector("style")?.nonce).toBe("abc123");

    const later = document.createElement("style");
    later.nonce = "abc123";
    document.head.append(later);
    await Promise.resolve();
    stop();
    expect(
      Array.from(target.head.querySelectorAll("style")).map(
        (element) => element.nonce
      )
    ).toEqual(["abc123", "abc123"]);
  });
});
