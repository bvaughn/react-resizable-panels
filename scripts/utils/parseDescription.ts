import type { Intent, Section } from "../../src/types";
import { formatDescriptionText } from "./formatDescriptionText.ts";

export function parseDescription(rawText: string) {
  const sections: Section[] = [];

  rawText.split("\n\n").forEach((chunk) => {
    let content = formatDescriptionText(chunk.trim());
    let intent: Intent | undefined = undefined;

    for (const char in INTENT_FLAGS) {
      if (content.startsWith(char)) {
        intent = INTENT_FLAGS[char as keyof typeof INTENT_FLAGS] as Intent;
        content = content.substring(char.length + 1);
      }
    }

    sections.push({
      content,
      intent
    });
  });

  return sections;
}

const INTENT_FLAGS = {
  "❌": "danger",
  "NOTE:": "none",
  ℹ️: "primary",
  "✅": "success",
  "⚠️": "warning"
};
