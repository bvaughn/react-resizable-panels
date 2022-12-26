import { ReactNode } from "react";
import { Link } from "react-router-dom";

import Code from "../../components/Code";
import { Language } from "../../suspense/SyntaxParsingCache";

import styles from "./Example.module.css";

export default function Example({
  code,
  exampleNode,
  headerNode,
  language = "jsx",
}: {
  code: string;
  exampleNode: ReactNode;
  headerNode: ReactNode;
  language?: Language;
}) {
  return (
    <div className={styles.Route}>
      <div className={styles.HeaderContainer}>
        <p>{headerNode}</p>
        <p>
          <Link to="/">Back to home</Link>
        </p>
      </div>
      <div className={styles.ExampleContainer}>{exampleNode}</div>
      <div className={styles.CodeContainer}>
        <Code className={styles.Code} code={code.trim()} language={language} />
      </div>
    </div>
  );
}
