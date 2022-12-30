import { Link } from "react-router-dom";

import Logo from "../../components/Logo";

import styles from "./styles.module.css";

export default function HomeRoute() {
  return (
    <div className={styles.HomeRoute}>
      <a
        className={styles.Link}
        href="https://github.com/bvaughn/react-resizable-panels"
      >
        <Logo />
      </a>
      <p>React components for resizable panels</p>
      <h2 className={styles.SubHeader}>Installation</h2>
      <div className={styles.Code}>
        <span className="tok-comment"># npm</span>
        <br />
        <span className="tok-operator">npm install </span>
        <span className="tok-variableName">react-resizable-panels</span>
        <br />
        <br />
        <span className="tok-comment"># yarn</span>
        <br />
        <span className="tok-operator">yarn add </span>
        <span className="tok-variableName">react-resizable-panels</span>
      </div>
      <h2 className={styles.SubHeader}>Examples</h2>
      <ul className={styles.List}>
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
        <li>
          <Link to="/examples/overflow">Overflow content</Link>
        </li>
        <li>
          <Link to="/examples/external-persistence">External persistence</Link>
        </li>
      </ul>
    </div>
  );
}
