import { Link } from "react-router-dom";

import styles from "./styles.module.css";

export default function HomeRoute() {
  return (
    <div className={styles.HomeRoute}>
      <h1 className={styles.Header}>
        <a href="https://github.com/bvaughn/react-resizable-panels">
          react-resizable-panels
        </a>
        <small className={styles.HeaderTagLine}>
          React components for resizable panels.
        </small>
      </h1>
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
          <Link to="/examples/nested">Nested groups</Link>
        </li>
        <li>
          <Link to="/examples/persistence">Persistent layouts</Link>
        </li>
        <li>
          <Link to="/examples/conditional">Conditional panels</Link>
        </li>
      </ul>
    </div>
  );
}
