import { Box, Callout, Code, Header, Link } from "react-lib-tools";
import { html as VerticalHTML } from "../../public/generated/examples/LayoutBasicsVertical.json";
import { html as VerticalGroupOverflowHTML } from "../../public/generated/examples/VerticalGroupOverflow.json";

export default function CommonQuestionsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header title="Common questions" />
      <dl>
        <dt
          className="text-lg text-fuchsia-300 font-bold"
          id="invalid-panel-layout"
        >
          Why do I see an "invalid panel layout" error?
        </dt>
        <dd className="mt-2 mb-4 flex flex-col gap-2">
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
        </dd>
        <dt
          className="text-lg text-fuchsia-300 font-bold"
          id="vertical-group-height"
        >
          Why is a vertical group not visible?
        </dt>
        <dd className="mt-2 mb-4 flex flex-col gap-2">
          <p>
            <code>Group</code> is a block-level element and so it will fill the
            width of the container it is rendered within. Horizontal groups will
            also expand to fit the height of <code>Panel</code> content.
            Vertical groups however require an explicit height (typically set
            using either the <code>className</code> or <code>style</code>{" "}
            props).
          </p>
          <Code html={VerticalHTML} />
        </dd>
        <dt
          className="text-lg text-fuchsia-300 font-bold"
          id="horizontal-group-height"
        >
          Why is a horizontal group's content too tall?
        </dt>
        <dd className="mt-2 mb-4 flex flex-col gap-2">
          <p>
            Horizontal <code>Groups</code> will fill expand to fit the height of
            their <code>Panel</code> contents. In this behavior is unwanted
            (e.g. when rendering a virtual list) the recommended fix is to add
            an explicit height to the <code>Groups</code> element.
          </p>
          <Code html={VerticalGroupOverflowHTML} />
        </dd>
      </dl>
    </Box>
  );
}
