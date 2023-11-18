import { Suspense, useMemo } from "react";

import {
  Language,
  ParsedTokens,
  escapeHtmlEntities,
  parsedTokensToHtml,
  syntaxParsingCache,
} from "../suspense/SyntaxParsingCache";

import styles from "./Code.module.css";

export default function Code({
  className = "",
  code,
  language = "jsx",
  showLineNumbers = false,
}: {
  className?: string;
  code: string;
  language: Language;
  showLineNumbers?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <Fallback
          className={className}
          code={code}
          showLineNumbers={showLineNumbers}
        />
      }
    >
      <Parser
        className={className}
        code={code}
        language={language}
        showLineNumbers={showLineNumbers}
      />
    </Suspense>
  );
}

function Fallback({
  className,
  code,
  showLineNumbers,
}: {
  className: string;
  code: string;
  showLineNumbers: boolean;
}) {
  const htmlLines = useMemo<string[]>(() => {
    return code.split("\n").map((line, index) => {
      const escaped = escapeHtmlEntities(line);

      if (showLineNumbers) {
        return `<span class="${styles.LineNumber}">${
          index + 1
        }</span> ${escaped}`;
      }

      return escaped;
    });
  }, [showLineNumbers, code]);

  const maxLineNumberLength = `${htmlLines.length + 1}`.length;

  return (
    <code
      className={[styles.Code, className].join(" ")}
      dangerouslySetInnerHTML={{ __html: htmlLines.join("<br/>") }}
      style={{
        // @ts-ignore
        "--max-line-number-length": `${maxLineNumberLength}ch`,
      }}
    />
  );
}

function Parser({
  className,
  code,
  language,
  showLineNumbers,
}: {
  className: string;
  code: string;
  language: Language;
  showLineNumbers: boolean;
}) {
  const tokens = syntaxParsingCache.read(code, language);
  return (
    <TokenRenderer
      className={className}
      tokens={tokens}
      showLineNumbers={showLineNumbers}
    />
  );
}

function TokenRenderer({
  className,
  showLineNumbers,
  tokens,
}: {
  className: string;
  showLineNumbers: boolean;
  tokens: ParsedTokens[];
}) {
  const maxLineNumberLength = `${tokens.length + 1}`.length;

  const html = useMemo<string>(() => {
    return tokens
      .map((lineTokens, index) => {
        const html = parsedTokensToHtml(lineTokens);

        if (showLineNumbers) {
          return `<span class="${styles.LineNumber}">${
            index + 1
          }</span> ${html}`;
        }

        return html;
      })
      .join("<br/>");
  }, [showLineNumbers, tokens]);

  return (
    <code
      className={[styles.Code, className].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        // @ts-ignore
        "--max-line-number-length": `${maxLineNumberLength}ch`,
      }}
    />
  );
}
