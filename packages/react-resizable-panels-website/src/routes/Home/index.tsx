import { Link } from "react-router-dom";
import Container from "../../components/Container";

import Logo from "../../components/Logo";

import styles from "./styles.module.css";

export default function HomeRoute() {
  return (
    <div className={styles.HomeRoute}>
      <Container className={styles.Container}>
        <div className={styles.TopRow}>
          <HeaderPanel />
        </div>
        <div className={styles.BottomRow}>
          <ExamplesPanel />
          <InstallationPanel />
        </div>
      </Container>
    </div>
  );
}

function ExampleLink({ path, title }: { path: string; title: string }) {
  return (
    <li className={styles.ExamplesListItem}>
      <Link className={styles.ExampleLink} to={`/examples/${path}`}>
        {title}
      </Link>
    </li>
  );
}

function ExamplesPanel() {
  return (
    <div className={styles.ExamplesPanel}>
      <h2 className={styles.SubHeader}>Examples</h2>
      <ul className={styles.ExamplesList}>
        <ExampleLink path="horizontal" title="Horizontal layouts" />
        <ExampleLink path="vertical" title="Vertical layouts" />
        <ExampleLink path="nested" title="Nested groups" />
        <ExampleLink path="persistence" title="Persistent layouts" />
        <ExampleLink path="overflow" title="Overflow content" />
        <ExampleLink path="collapsible" title="Collapsible panels" />
        <ExampleLink path="conditional" title="Conditional panels" />
        <ExampleLink path="external-persistence" title="External persistence" />
        <ExampleLink path="imperative-api" title="Imperative API" />
      </ul>
    </div>
  );
}

function HeaderPanel() {
  return (
    <div className={styles.HeaderPanel}>
      <a
        className={styles.HeaderLink}
        href="https://github.com/bvaughn/react-resizable-panels"
      >
        <Logo />
      </a>
      <p className={styles.TagLine}>React components for resizable panels</p>
    </div>
  );
}

function InstallationPanel() {
  return (
    <div className={styles.InstallationPanel}>
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
    </div>
  );
}
