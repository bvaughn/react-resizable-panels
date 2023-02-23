import { Suspense, useMemo } from "react";

import {
  Language,
  highlightSyntaxSuspense,
  parsedTokensToHtml,
} from "../suspense/SyntaxParsingCache";
import { ParsedTokens } from "../suspense/SyntaxParsingCache";

import styles from "./Code.module.css";
import Icon from "./Icon";

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
    <Suspense fallback={<Loader />}>
      <Parser
        className={className}
        code={code}
        language={language}
        showLineNumbers={showLineNumbers}
      />
    </Suspense>
  );
}

function Loader() {
  return (
    <div className={styles.Loader}>
      <Icon type="loading" /> Loading
    </div>
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
  const tokens = highlightSyntaxSuspense(code, language);
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
  className?: string;
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
