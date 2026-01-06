import { ArrowTurnDownRightIcon } from "@heroicons/react/20/solid";
import {
  AppRoot,
  Callout,
  Code,
  NavSection,
  type CommonQuestion
} from "react-lib-tools";
import { repository } from "../package.json";
import { html as VerticalHTML } from "../public/generated/examples/LayoutBasicsVertical.json";
import { html as VerticalGroupOverflowHTML } from "../public/generated/examples/VerticalGroupOverflow.json";
import { Link } from "./components/Link";
import { NavLink } from "./components/NavLink";
import { Group } from "./components/styled-panels/Group";
import { Panel } from "./components/styled-panels/Panel";
import { Separator } from "./components/styled-panels/Separator";
import { routes } from "./routes";

export default function App() {
  return (
    <AppRoot
      commonQuestions={commonQuestions}
      navLinks={
        <>
          <NavLink path="/">Getting started</NavLink>
          <NavSection label="Examples">
            <NavLink path="/examples/the-basics">The basics</NavLink>
            <NavLink path="/examples/min-max-sizes">Min/max sizes</NavLink>
            <NavLink path="/examples/collapsible-panels">
              Collapsible panels
            </NavLink>
            <NavLink path="/examples/persistent-layout">
              Persistent layouts
            </NavLink>
            <NavLink path="/examples/persistent-layout/conditional-panels">
              <ArrowTurnDownRightIcon className="size-4 fill-white/60" />
              Conditional panels
            </NavLink>
            <NavLink path="/examples/persistent-layout/server-rendering">
              <ArrowTurnDownRightIcon className="size-4 fill-white/60" /> Server
              rendering
            </NavLink>
            <NavLink path="/examples/persistent-layout/server-components">
              <ArrowTurnDownRightIcon className="size-4 fill-white/60" /> Server
              components
            </NavLink>
            <NavLink path="/examples/nested-groups">Nested groups</NavLink>
            <NavLink path="/examples/conditional-panels">
              Conditional panels
            </NavLink>
            <NavLink path="/examples/fixed-size-panels">
              Fixed size panels
            </NavLink>
            <NavLink path="/examples/custom-css-styles">
              Custom CSS styles
            </NavLink>
          </NavSection>
          <NavSection label="Props">
            <NavLink path="/props/group">Group component</NavLink>
            <NavLink path="/props/panel">Panel component</NavLink>
            <NavLink path="/props/separator">Separator component</NavLink>
          </NavSection>
          <NavSection label="Imperative APIs">
            <NavLink path="/imperative-api/group">Group API</NavLink>
            <NavLink path="/imperative-api/panel">Panel API</NavLink>
          </NavSection>
          <NavSection label="Hooks">
            <NavLink path="/hooks/use-default-layout">useDefaultLayout</NavLink>
            <NavLink path="/hooks/use-group-ref">useGroupRef</NavLink>
            <NavLink path="/hooks/use-group-callback-ref">
              useGroupCallbackRef
            </NavLink>
            <NavLink path="/hooks/use-panel-ref">usePanelRef</NavLink>
            <NavLink path="/hooks/use-panel-callback-ref">
              usePanelCallbackRef
            </NavLink>
          </NavSection>
          <div>
            <NavLink path="/platform-requirements">Requirements</NavLink>
            <NavLink path="/common-questions">Common questions</NavLink>
            <NavLink path="/support">Support</NavLink>
          </div>
        </>
      }
      packageDescription="flexible layout components"
      packageName="react-resizable-panels"
      repositoryUrl={repository.url}
      routes={routes}
      overview={
        <>
          <div>
            This library is a set of React components that can be used to build
            resizable layouts like the one below:
          </div>
          <Group className="h-20 sm:h-15">
            <Panel className="p-1" minSize={100}>
              This is a resizable panel
            </Panel>
            <Separator />
            <Panel className="p-1" minSize={100}>
              This is also a resizable panel
            </Panel>
          </Group>
          <div>
            There are many types of layouts, covered in the{" "}
            <Link to="/examples/the-basics">examples</Link> section of the docs.
            Check out the <Link to="/support">support</Link> page if you have
            questions.
          </div>
        </>
      }
      versions={VERSIONS}
    />
  );
}

const commonQuestions: CommonQuestion[] = [
  {
    id: "invalid-panel-layout",
    question: 'Why do I see an "invalid panel layout" error?',
    answer: (
      <>
        <p>
          This error means that a <code>Group</code> layout (or the sum total of{" "}
          <code>Panel</code> default sizes) does not add up to 100%.
        </p>
        <p>
          If the layout you've specified does add up to 100, the most likely
          remaining cause is that you've specified sizes as <em>pixels</em>{" "}
          rather than <em>percentages</em> as per this note from the{" "}
          <Link to="/props/panel">
            <code>Panel</code> docs
          </Link>
          :
        </p>
        <Callout intent="primary" minimal>
          Numeric values are assumed to be pixels. Strings without explicit
          units are assumed to be percentages (0%..100%).
        </Callout>
      </>
    )
  },
  {
    id: "vertical-group-height",
    question: "Why is a vertical group not visible?",
    answer: (
      <>
        <p>
          <code>Group</code> is a block-level element and so it will fill the
          width of the container it is rendered within. Horizontal groups will
          also expand to fit the height of <code>Panel</code> content. Vertical
          groups however require an explicit height (typically set using either
          the <code>className</code> or <code>style</code> props).
        </p>
        <Code html={VerticalHTML} />
      </>
    )
  },
  {
    id: "horizontal-group-height",
    question: "Why is a horizontal group's content too tall?",
    answer: (
      <>
        <p>
          Horizontal <code>Groups</code> will fill expand to fit the height of
          their <code>Panel</code> contents. In this behavior is unwanted (e.g.
          when rendering a virtual list) the recommended fix is to add an
          explicit height to the <code>Groups</code> element.
        </p>
        <Code html={VerticalGroupOverflowHTML} />
      </>
    )
  },
  {
    id: "local-storage-undefined",
    question: "ReferenceError: localStorage is not defined",
    answer: (
      <>
        <p>
          The <code>useDefaultLayout</code> hook saves layouts to{" "}
          <code>localStorage</code> by default. This does not work for
          server-rendered applications though, since <code>localStorage</code>{" "}
          is only defined on the client.
        </p>
        <p>
          Refer to the{" "}
          <Link to="/examples/persistent-layout/server-rendering">
            server rendering
          </Link>{" "}
          or{" "}
          <Link to="/examples/persistent-layout/server-components">
            server components
          </Link>{" "}
          docs for examples of how to save layouts on the server.
        </p>
      </>
    )
  }
];

const VERSIONS = {
  "4.0.8": "https://react-resizable-panels.vercel.app/",
  "3.0.6":
    "https://react-resizable-panels-au2wmqbbr-brian-vaughns-projects.vercel.app/",
  "2.1.7":
    "https://react-resizable-panels-ca7gk2gh5-brian-vaughns-projects.vercel.app/",
  "1.0.10": ""
};
