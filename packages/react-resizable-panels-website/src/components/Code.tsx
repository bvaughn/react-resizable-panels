import { Suspense, useMemo } from "react";

import {
  Language,
  parse,
  parsedTokensToHtml,
} from "../suspense/SyntaxParsingCache";
import { ParsedTokens } from "../suspense/SyntaxParsingCache";
import Copy from "./Copy";

import styles from "./Code.module.css";

export default function Code({
  className = "",
  code,
  language = "jsx",
  showLineNumbers = false,
  copyHidden = false,
}: {
  className?: string;
  code: string;
  language: Language;
  showLineNumbers?: boolean;
  copyHidden?: boolean;
}) {
  return (
    <Suspense>
      <Parser
        className={className}
        code={code}
        language={language}
        showLineNumbers={showLineNumbers}
        copyHidden={copyHidden}
      />
    </Suspense>
  );
}

function Parser({
  className,
  code,
  language,
  showLineNumbers,
  copyHidden = false,
}: {
  className: string;
  code: string;
  language: Language;
  showLineNumbers: boolean;
  copyHidden?: boolean;
}) {
  const tokens = parse(code, language);
  return (
    <TokenRenderer
      className={className}
      tokens={tokens}
      showLineNumbers={showLineNumbers}
      code={code}
      copyHidden={copyHidden}
    />
  );
}

function TokenRenderer({
  className,
  showLineNumbers,
  tokens,
  code,
  copyHidden = false,
}: {
  className?: string;
  showLineNumbers: boolean;
  tokens: ParsedTokens[];
  code: string;
  copyHidden?: boolean;
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
    <>
      <Copy code={code} hidden={copyHidden} />
      <code
      className={[styles.Code, 'code', className].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        // @ts-ignore
        "--max-line-number-length": `${maxLineNumberLength}ch`
      }}/>
    </>
  );
}
