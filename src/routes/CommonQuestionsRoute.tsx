import { Box, Code, Header } from "react-lib-tools";
import { html as VerticalHTML } from "../../public/generated/examples/LayoutBasicsVertical.json";
import { html as VerticalGroupOverflowHTML } from "../../public/generated/examples/VerticalGroupOverflow.json";

export default function CommonQuestionsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header title="Common questions" />
      <dl>
        <dt className="text-lg text-fuchsia-300 font-bold">
          Why is a vertical list not visible?
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
        <dt className="text-lg text-fuchsia-300 font-bold">
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
