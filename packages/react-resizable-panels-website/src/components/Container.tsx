import { PropsWithChildren } from "react";

import styles from "./Container.module.css";

export default function Container({
  children,
  className = "",
}: PropsWithChildren & { className?: string }) {
  return <div className={`${className} ${styles.Container}`}>{children}</div>;
}
