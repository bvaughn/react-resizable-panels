import { ensureSyntaxTree } from "@codemirror/language";
import { EditorState, Extension } from "@codemirror/state";
import { classHighlighter, highlightTree } from "@lezer/highlight";
import createWakeable from "./createWakeable";
import {
  Record,
  STATUS_PENDING,
  STATUS_REJECTED,
  STATUS_RESOLVED,
  Wakeable,
} from "./types";
import { importModule } from "./ImportCache";

export type Language =
  | "css"
  | "html"
  | "javascript"
  | "jsx"
  | "markdown"
  | "tsx"
  | "typescript";

export type ParsedToken = {
  columnIndex: number;
  type: string | null;
  value: string;
};

export type ParsedTokens = ParsedToken[];

export type IncrementalParser = {
  isComplete: () => boolean;
  parseChunk: (
    codeChunk: string,
    isCodeComplete: boolean,
    chunkSize?: number,
    maxParseTime?: number
  ) => void;
  parsedTokensByLine: ParsedTokens[];
};

export type StreamSubscriber = () => void;
export type UnsubscribeFromStream = () => void;

export type StreamingParser = {
  parsedTokensByLine: ParsedTokens[];
  parsedTokensPercentage: number;
  rawTextByLine: string[];
  rawTextPercentage: number;
  subscribe(subscriber: StreamSubscriber): UnsubscribeFromStream;
};

export const DEFAULT_MAX_CHARACTERS = 500_000;
export const DEFAULT_MAX_TIME = 5_000;

const records: Map<string, Record<ParsedTokens[]>> = new Map();

export function parse(code: string, language: Language): ParsedTokens[] | null {
  const languageExtension = getLanguageExtension(language);

  let record = records.get(language + code);
  if (record == null) {
    record = {
      status: STATUS_PENDING,
      value: createWakeable<ParsedTokens[]>(
        `language: "${language}", code: "${code}"`
      ),
    };

    records.set(code, record);

    // Suspense caches fire and forget; errors will be handled within the fetch function.
    parseCode(code, languageExtension, record, record.value);
  }

  if (record!.status === STATUS_RESOLVED) {
    return record!.value;
  } else {
    throw record!.value;
  }
}

async function parseCode(
  code: string,
  languageExtension: Extension,
  record: Record<ParsedTokens[]>,
  wakeable: Wakeable<ParsedTokens[]>
) {
  try {
    const parser = incrementalParser(languageExtension);
    if (parser == null) {
      record.status = STATUS_REJECTED;
      record.value = `Could not instantiate parser`;

      wakeable.reject(record.value);
    }

    parser.parseChunk(code, true);

    record.status = STATUS_RESOLVED;
    record.value = parser.parsedTokensByLine;

    wakeable.resolve(record.value);
  } catch (error) {
    record.status = STATUS_REJECTED;
    record.value = error;

    wakeable.reject(record.value);
  }
}

function incrementalParser(
  languageExtension: Extension
): IncrementalParser | null {
  let complete: boolean = false;

  const parsedTokens: ParsedTokens[] = [];

  const currentLineState = {
    parsedTokens: [] as ParsedTokens,
    rawString: "",
  };

  let parsedCharacterIndex = 0;

  function parseChunk(
    code: string,
    isCodeComplete: boolean,
    maxCharacters: number = DEFAULT_MAX_CHARACTERS,
    maxTime: number = DEFAULT_MAX_TIME
  ) {
    let codeToParse = code.slice(parsedCharacterIndex);

    // The logic below to trim code sections only works with "\n"
    codeToParse = codeToParse.replace(/\r\n?|\n|\u2028|\u2029/g, "\n");

    if (codeToParse.length > maxCharacters || !isCodeComplete) {
      let index = maxCharacters - 1;
      while (index > 0 && codeToParse.charAt(index) !== "\n") {
        index--;
      }
      if (index === 0) {
        while (
          index < codeToParse.length &&
          codeToParse.charAt(index) !== "\n"
        ) {
          index++;
        }
      }
      codeToParse = codeToParse.slice(0, index + 1);
    }

    const state = EditorState.create({
      doc: codeToParse,
      extensions: [languageExtension],
    });

    const tree = ensureSyntaxTree(state!, maxCharacters, maxTime);
    if (tree === null) {
      return;
    }

    let characterIndex = 0;

    highlightTree(
      tree,
      classHighlighter,
      (from: number, to: number, className: string) => {
        if (from > characterIndex) {
          // No style applied to the token between position and from.
          // This typically indicates white space or newline characters.
          processSection(
            currentLineState,
            parsedTokens,
            codeToParse.slice(characterIndex, from),
            ""
          );
        }

        processSection(
          currentLineState,
          parsedTokens,
          codeToParse.slice(from, to),
          className
        );

        characterIndex = to;
      }
    );

    const maxPosition = codeToParse.length - 1;
    if (characterIndex < maxPosition) {
      // No style applied on the trailing text.
      // This typically indicates white space or newline characters.
      processSection(
        currentLineState,
        parsedTokens,
        codeToParse.slice(characterIndex, maxPosition),
        ""
      );
    }

    if (currentLineState.parsedTokens.length) {
      parsedTokens.push(currentLineState.parsedTokens);
    }

    parsedCharacterIndex += characterIndex + 1;

    complete = isCodeComplete && parsedCharacterIndex >= code.length;

    // Anything that's left should de-opt to plain text.
    if (parsedCharacterIndex < codeToParse.length) {
      let nextIndex = codeToParse.indexOf("\n", parsedCharacterIndex);

      let parsedLineTokens: ParsedToken[] = [];

      while (true) {
        const line =
          nextIndex >= 0
            ? codeToParse.substring(parsedCharacterIndex, nextIndex)
            : codeToParse.substring(parsedCharacterIndex);

        parsedLineTokens.push({
          columnIndex: 0,
          type: null,
          value: line,
        });

        if (nextIndex >= 0) {
          parsedTokens.push(parsedLineTokens);

          parsedLineTokens = [];
        } else if (nextIndex === -1) {
          break;
        }

        parsedCharacterIndex = nextIndex + 1;
        nextIndex = codeToParse.indexOf("\n", parsedCharacterIndex);
      }

      if (parsedLineTokens.length) {
        parsedTokens.push(parsedLineTokens);
      }
    }
  }

  return {
    isComplete: () => complete,
    parsedTokensByLine: parsedTokens,
    parseChunk,
  };
}

function processSection(
  currentLineState: {
    parsedTokens: ParsedTokens;
    rawString: string;
  },
  parsedTokens: ParsedTokens[],
  section: string,
  className: string
) {
  const tokenType = className?.substring(4) || null; // Remove "tok-" prefix;

  let index = 0;
  let nextIndex = section.indexOf("\n");

  while (true) {
    const substring =
      nextIndex >= 0
        ? section.substring(index, nextIndex)
        : section.substring(index);

    const token: ParsedToken = {
      columnIndex: currentLineState.rawString.length,
      type: tokenType,
      value: substring,
    };

    currentLineState.parsedTokens.push(token);
    currentLineState.rawString += substring;

    if (nextIndex === -1) {
      break;
    }

    if (nextIndex >= 0) {
      parsedTokens.push(currentLineState.parsedTokens);

      currentLineState.parsedTokens = [];
      currentLineState.rawString = "";
    }

    index = nextIndex + 1;
    nextIndex = section.indexOf("\n", index);
  }
}

export function parsedTokensToHtml(tokens: ParsedToken[]): string {
  return tokens
    .map((token) => {
      const className = token.type ? `tok-${token.type}` : "";
      const escapedValue = escapeHtmlEntities(token.value);
      return `<span class="${className}">${escapedValue}</span>`;
    })
    .join("");
}

function escapeHtmlEntities(rawString: string): string {
  return rawString.replace(
    /[\u00A0-\u9999<>\&]/g,
    (substring) => "&#" + substring.charCodeAt(0) + ";"
  );
}

function getLanguageExtension(language: Language): Extension {
  switch (language) {
    case "css":
      const { cssLanguage } = importModule("@codemirror/lang-css");
      return cssLanguage.extension;
    case "html":
      const { htmlLanguage } = importModule("@codemirror/lang-html");
      return htmlLanguage.extension;
    case "javascript":
      const { javascriptLanguage } = importModule(
        "@codemirror/lang-javascript"
      );
      return javascriptLanguage.extension;
    case "jsx":
      const { jsxLanguage } = importModule("@codemirror/lang-javascript");
      return jsxLanguage.extension;
    case "markdown":
      const { markdownLanguage } = importModule("@codemirror/lang-markdown");
      return markdownLanguage.extension;
    case "tsx":
      const { tsxLanguage } = importModule("@codemirror/lang-javascript");
      return tsxLanguage.extension;
    case "typescript":
      const { typescriptLanguage } = importModule(
        "@codemirror/lang-javascript"
      );
      return typescriptLanguage.extension;
    default:
      throw Error(`Unsupported language: "${language}"`);
  }
}
