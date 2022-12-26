import { Link } from "react-router-dom";

import styles from "./styles.module.css";

export default function HomeRoute() {
  return (
    <div className={styles.HomeRoute}>
      <h1 className={styles.Header}>react-resizable-panels</h1>
      <h2 className={styles.SubHeader}>
        React components for resizable panels.
      </h2>
      <p>To get started:</p>
      <pre>
        <code className={styles.Code}>npm install react-resizable-panels</code>
      </pre>
      <h2 className={styles.SubHeader}>Usage examples</h2>
      <ul>
        <li>
          <Link to="/examples/horizontal">Horizontal layouts</Link>
        </li>
        <li>
          <Link to="/examples/vertical">Vertical layouts</Link>
        </li>
        <li>
          Nested groups <small>(coming soon)</small>
        </li>
        <li>
          Conditional panels <small>(coming soon)</small>
        </li>
        <li>
          Persistent layouts <small>(coming soon)</small>
        </li>
      </ul>
      <p>
        Report issues on GitHub at{" "}
        <a href="https://github.com/bvaughn/react-resizable-panels">
          github.com/bvaughn/react-resizable-panels
        </a>
        .
      </p>
    </div>
  );
}
