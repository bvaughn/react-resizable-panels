import { Suspense, useMemo } from "react";

import {
  Language,
  parse,
  parsedTokensToHtml,
} from "../suspense/SyntaxParsingCache";
import { ParsedTokens } from "../suspense/SyntaxParsingCache";

import styles from "./Code.module.css";

export default function Code({
  className = "",
  code,
  language = "jsx",
}: {
  className?: string;
  code: string;
  language: Language;
}) {
  return (
    <Suspense>
      <Parser className={className} code={code} language={language} />
    </Suspense>
  );
}

function Parser({
  className,
  code,
  language,
}: {
  className?: string;
  code: string;
  language: Language;
}) {
  const tokens = parse(code, language);
  return <TokenRenderer className={className} tokens={tokens} />;
}

function TokenRenderer({
  className,
  tokens,
}: {
  className?: string;
  tokens: ParsedTokens[];
}) {
  const html = useMemo<string>(() => {
    const html: string[] = tokens.map((lineTokens) =>
      parsedTokensToHtml(lineTokens)
    );
    return html.join("<br/>");
  }, [tokens]);
  console.group("tokens");
  console.log(tokens);
  console.groupEnd();
  console.group("html");
  console.log(html);
  console.groupEnd();

  return (
    <code
      className={[styles.Code, className].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
