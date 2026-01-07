import { ArrowTurnDownRightIcon } from "@heroicons/react/20/solid";
import {
  AppRoot,
  Callout,
  Code,
  ExternalLink,
  NavSection,
  type CommonQuestion
} from "react-lib-tools";
import { repository } from "../package.json";
import { html as GroupExplicitHeightHTML } from "../public/generated/examples/GroupExplicitHeight.json";
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
          <Group>
            <Panel className="p-1" minSize={100}>
              This panel is resizable
            </Panel>
            <Separator />
            <Panel className="p-1" minSize={100}>
              This one is too
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
          By default, <code>Group</code> elements specify a default style{" "}
          <code>height:100%</code>. However according to the{" "}
          <ExternalLink href="https://www.w3.org/TR/CSS2/visudet.html#the-height-property">
            w3 spec
          </ExternalLink>
          :
        </p>
        <Callout minimal>
          The percentage is calculated with respect to the height of the
          generated box's containing block. If the height of the containing
          block is not specified explicitly (i.e., it depends on content
          height), and this element is not absolutely positioned, the value
          computes to "auto".
        </Callout>
        <p>
          Put another way, fixing this requires setting an explicit height
          either on the <code>Group</code> itself or on its parent{" "}
          <code>HTMLElement</code>.
        </p>
        <Code html={GroupExplicitHeightHTML} />
        <Callout intent="warning">
          Note that because the default height is an inline style, it can only
          be overridden by another inline style or an{" "}
          <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/important">
            !important
          </ExternalLink>{" "}
          CSS rule.
        </Callout>
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
