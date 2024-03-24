import { Link } from "react-router-dom";
import Container from "../../components/Container";

import Logo from "../../components/Logo";

import styles from "./styles.module.css";

const LINKS = [
  { path: "horizontal", title: "Horizontal layouts" },
  { path: "vertical", title: "Vertical layouts" },
  { path: "nested", title: "Nested groups" },
  { path: "persistence", title: "Persistent layouts" },
  { path: "overflow", title: "Overflow content" },
  { path: "collapsible", title: "Collapsible panels" },
  { path: "conditional", title: "Conditional panels" },
  { path: "external-persistence", title: "External persistence" },
  { path: "imperative-panel-api", title: "Imperative Panel API" },
  { path: "imperative-panel-group-api", title: "Imperative PanelGroup API" },
];

export default function HomeRoute() {
  return (
    <Container className={styles.Container}>
      <div className={styles.TopRow}>
        <HeaderPanel />
      </div>
      <div className={styles.BottomRow}>
        <ExamplesPanel />
        <InstallationPanel />
      </div>
    </Container>
  );
}

function ExampleLink({
  index,
  path,
  title,
}: {
  index: number;
  path: string;
  title: string;
}) {
  return (
    <li className={styles.ExamplesListItem}>
      <div className={styles.ListItemNumber}>{index + 1}</div>
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
        {LINKS.map((link, index) => (
          <ExampleLink
            index={index}
            key={index}
            path={link.path}
            title={link.title}
          />
        ))}
      </ul>
    </div>
  );
}

function HeaderPanel() {
  return (
    <a
      className={styles.HeaderLink}
      href="https://github.com/bvaughn/react-resizable-panels"
    >
      <span className={styles.Header}>
        <span className={styles.HeaderRow}>
          <Logo className={styles.HeaderLogo} />
          <span className={styles.HeaderTexts}>
            <span className={styles.HeaderText}>react</span>
            <span className={styles.HeaderText}>resizable</span>
            <span className={styles.HeaderText}>panels</span>
          </span>
        </span>
        <p className={styles.HeaderTagLine}>
          React components for resizable panels
        </p>
      </span>
    </a>
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
        <br />
        <br />
        <span className="tok-comment"># pnpm</span>
        <br />
        <span className="tok-operator">pnpm add </span>
        <span className="tok-variableName">react-resizable-panels</span>
        <br />
        <br />
        <span className="tok-comment"># bun</span>
        <br />
        <span className="tok-operator">bun add </span>
        <span className="tok-variableName">react-resizable-panels</span>
      </div>
    </div>
  );
}
