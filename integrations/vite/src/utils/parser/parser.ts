import { transformAttributesBeforeParsing } from "./transformAttributesBeforeParsing";
import { translateNode } from "./translateNode";

export function parser(code: string) {
  // Strip self-closing tags
  // This naive approach assumes single line tags (e.g. "<foo maybe-bar />")
  code = code.trim().replace(/<([a-zA-Z]+)(.+) ?\/>/g, "<$1$2></$1>");

  // Pre-convert camel cased attributes since HTML attributes are always case-insensitive/lowercase
  code = transformAttributesBeforeParsing(code);

  const element = document.createElement("div");
  element.innerHTML = code;

  return translateNode(element.firstChild);
}
