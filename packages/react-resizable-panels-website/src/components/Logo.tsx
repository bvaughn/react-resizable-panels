import { PropsWithChildren } from "react";

import styles from "./Logo.module.css";

export default function Logo({ children = null }: PropsWithChildren) {
  return (
    <span className={styles.Logo}>
      <span className={styles.Row}>
        <span className={styles.Column}>
          <span className={styles.ColorChip}></span>
          <span className={styles.ColorChip}></span>
        </span>
        <span className={styles.Column}>
          <span className={styles.ColorChip}></span>
          <span className={styles.ColorChip}></span>
        </span>
        <span className={styles.Texts}>
          <span className={styles.Text}>react</span>
          <span className={styles.Text}>resizable</span>
          <span className={styles.Text}>panels</span>
        </span>
      </span>
      {children}
    </span>
  );
}
