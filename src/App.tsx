import {
  AppRoot,
  Callout,
  Code,
  ExternalLink,
  type CommonQuestion,
  type DefaultPath,
  type NavConfig
} from "react-lib-tools";
import { repository } from "../package.json";
import Logo from "../public/favicon.svg?react";
import { html as ConditionallyRenderPanel } from "../public/generated/examples/ConditionallyRenderPanel.json";
import { html as GroupExplicitHeightHTML } from "../public/generated/examples/GroupExplicitHeight.json";
import { Link } from "./components/Link";
import { Group } from "./components/styled-panels/Group";
import { Panel } from "./components/styled-panels/Panel";
import { Separator } from "./components/styled-panels/Separator";
import { routes, type Path } from "./routes";

export default function App() {
  return (
    <AppRoot
      commonQuestions={commonQuestions}
      enableSiteSearch
      nav={nav}
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
      packageDescription="flexible layout components"
      packageLogo={<Logo className="rrp-logo w-8 h-8" />}
      packageName="react-resizable-panels"
      repositoryUrl={repository.url}
      routes={routes}
      versions={VERSIONS}
    />
  );
}

const nav: NavConfig<Path | DefaultPath> = [
  { path: "/", title: "Getting started" },
  {
    title: "Flex",
    links: [
      { path: "/examples/the-basics", title: "The basics" },
      { path: "/examples/min-max-sizes", title: "Min/max sizes" },
      { path: "/examples/collapsible-panels", title: "Collapsible panels" },
      {
        path: "/examples/persistent-layout",
        title: "Persistent layouts",
        children: [
          {
            path: "/examples/persistent-layout/conditional-panels",
            title: "Conditional panels"
          },
          {
            path: "/examples/persistent-layout/server-rendering",
            title: "Server rendering"
          },
          {
            path: "/examples/persistent-layout/server-components",
            title: "Server components"
          }
        ]
      },
      { path: "/examples/nested-groups", title: "Nested groups" },
      { path: "/examples/conditional-panels", title: "Conditional panels" },
      { path: "/examples/fixed-size-panels", title: "Fixed size panels" },
      { path: "/examples/disabled-panels", title: "Disabled panels" },
      {
        path: "/examples/panel-resize-behavior",
        title: "Panel resize behavior"
      },
      {
        path: "/examples/group-resize-behavior",
        title: "Group resize behavior"
      },
      { path: "/examples/overflow", title: "Overflow" },
      { path: "/examples/custom-css-styles", title: "Custom CSS styles" }
    ]
  },
  {
    title: "Grids",
    links: [
      { path: "/examples/grid-basics", title: "The basics" },
      { path: "/examples/grid-constraints", title: "Min/max sizes" },
      { path: "/examples/gridlines", title: "Gridlines" },
      { path: "/examples/collapsible-grid-cells", title: "Collapsible cells" }
    ]
  },
  {
    title: "Props",
    links: [
      { path: "/props/cell", title: "Cell" },
      { path: "/props/grid", title: "Grid" },
      { path: "/props/gridline", title: "Gridline" },
      { path: "/props/group", title: "Group" },
      { path: "/props/panel", title: "Panel" },
      { path: "/props/separator", title: "Separator" }
    ]
  },
  {
    title: "Imperative APIs",
    links: [
      { path: "/imperative-api/grid", title: "Grid" },
      { path: "/imperative-api/grid-track", title: "GridTrack" },
      { path: "/imperative-api/group", title: "Group" },
      { path: "/imperative-api/panel", title: "Panel" }
    ]
  },
  {
    title: "Hooks",
    links: [
      { path: "/hooks/use-default-layout", title: "useDefaultLayout" },
      { path: "/hooks/use-default-grid-layout", title: "useDefaultGridLayout" },
      { path: "/hooks/use-grid-ref", title: "useGridRef" },
      { path: "/hooks/use-grid-callback-ref", title: "useGridCallbackRef" },
      { path: "/hooks/use-group-ref", title: "useGroupRef" },
      { path: "/hooks/use-group-callback-ref", title: "useGroupCallbackRef" },
      { path: "/hooks/use-panel-ref", title: "usePanelRef" },
      { path: "/hooks/use-panel-callback-ref", title: "usePanelCallbackRef" }
    ]
  },
  { path: "/platform-requirements", title: "Requirements" },
  { path: "/common-questions", title: "Common questions" },
  { path: "/support", title: "Support" }
];

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
        <Callout intent="primary">
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
        <Callout intent="primary">
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
        <Callout intent="primary">
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
  },
  {
    id: "conditionally-render-panel",
    question: "How can I conditionally render a Panel based on screen size?",
    answer: (
      <>
        <p>
          The recommended way is to use the{" "}
          <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver">
            ResizeObserver
          </ExternalLink>{" "}
          API, either through a hook like{" "}
          <ExternalLink href="https://npmjs.com/package/use-resize-observer">
            useResizeObserver
          </ExternalLink>{" "}
          or a component like{" "}
          <ExternalLink href="https://react-virtualized-auto-sizer.vercel.app/">
            react-virtualized-auto-sizer
          </ExternalLink>
          .
        </p>
        <Code html={ConditionallyRenderPanel} />
        <Callout intent="primary">
          Putting the <code>defaultSize</code> on the conditional{" "}
          <code>Panel</code> is the easiest way to avoid invalid layout
          constraints in this type of scenario.
        </Callout>
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
