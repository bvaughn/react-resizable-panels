import { Box, Callout, Code, Header, Link } from "react-lib-tools";
import { html as VerticalHTML } from "../../public/generated/examples/LayoutBasicsVertical.json";
import { html as VerticalGroupOverflowHTML } from "../../public/generated/examples/VerticalGroupOverflow.json";
import type { PropsWithChildren } from "react";

export default function CommonQuestionsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header title="Common questions" />
      <dl>
        <Question id="invalid-panel-layout">
          Why do I see an "invalid panel layout" error?
        </Question>
        <Answer>
          <p>
            This error means that a <code>Group</code> layout (or the sum total
            of <code>Panel</code> default sizes) does not add up to 100%.
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
        </Answer>
        <Question id="vertical-group-height">
          Why is a vertical group not visible?
        </Question>
        <Answer>
          <p>
            <code>Group</code> is a block-level element and so it will fill the
            width of the container it is rendered within. Horizontal groups will
            also expand to fit the height of <code>Panel</code> content.
            Vertical groups however require an explicit height (typically set
            using either the <code>className</code> or <code>style</code>{" "}
            props).
          </p>
          <Code html={VerticalHTML} />
        </Answer>
        <Question id="horizontal-group-height">
          Why is a horizontal group's content too tall?
        </Question>
        <Answer>
          <p>
            Horizontal <code>Groups</code> will fill expand to fit the height of
            their <code>Panel</code> contents. In this behavior is unwanted
            (e.g. when rendering a virtual list) the recommended fix is to add
            an explicit height to the <code>Groups</code> element.
          </p>
          <Code html={VerticalGroupOverflowHTML} />
        </Answer>
      </dl>
    </Box>
  );
}

function Question({ children, id }: PropsWithChildren<{ id: string }>) {
  return (
    <dt className="pt-4" id={id}>
      <a className="text-lg text-fuchsia-300! font-bold" href={`#${id}`}>
        {children}
      </a>
    </dt>
  );
}

function Answer({ children }: PropsWithChildren) {
  return <dd className="mt-2 flex flex-col gap-2">{children}</dd>;
}
