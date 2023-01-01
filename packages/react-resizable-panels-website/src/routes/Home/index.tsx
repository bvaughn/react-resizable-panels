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
        <Example path="horizontal" title="Horizontal layouts" />
        <Example path="vertical" title="Vertical layouts" />
        <Example path="nested" title="Nested groups" />
        <Example path="persistence" title="Persistent layouts" />
        <Example path="overflow" title="Overflow content" />
        <Example path="collapsible" title="Collapsible panels" />
        <Example path="conditional" title="Conditional panels" />
        <Example path="external-persistence" title="External persistence" />
      </ul>
    </div>
  );
}

function Example({ path, title }: { path: string; title: string }) {
  return (
    <li>
      <Link to={`/examples/${path}`}>{title}</Link>
    </li>
  );
}
