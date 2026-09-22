import type { PropsWithChildren } from "react";
import { Box, Callout, Code, Header, cn } from "react-lib-tools";
import {
  Cell as CellExternal,
  Grid as GridExternal,
  GridSeparator as GridSeparatorExternal,
  type CellProps,
  type GridProps,
  type GridSeparatorProps
} from "react-resizable-panels";
import { html as ConstraintsHTML } from "../../public/generated/examples/GridConstraints.json";
import { html as ImperativeApiHTML } from "../../public/generated/examples/GridImperativeApi.json";
import { html as LayoutHTML } from "../../public/generated/examples/GridLayout.json";
import { html as SeparatorsHTML } from "../../public/generated/examples/GridSeparators.json";
import { html as SpansHTML } from "../../public/generated/examples/GridSpans.json";
import { PanelText } from "../components/styled-panels/PanelText";

export default function GridLayoutRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Examples" title="Grid layouts" />
      <div>
        The <code>Grid</code> component arranges resizable <code>Cell</code>s in
        two dimensions. Columns are resized horizontally and rows are resized
        vertically. Dragging the point where a column boundary meets a row
        boundary resizes both at once.
      </div>
      <Code html={LayoutHTML} />
      <Grid className="h-60!" columns={2} rows={2}>
        <Cell row={0} column={0}>
          A
        </Cell>
        <Cell row={0} column={1}>
          B
        </Cell>
        <Cell row={1} column={0}>
          C
        </Cell>
        <Cell row={1} column={1}>
          D
        </Cell>
      </Grid>
      <Callout intent="primary">
        Unlike nested groups, the tracks of a grid are shared; resizing a column
        resizes it in every row.
      </Callout>
      <Header section="Grid layouts" title="Spanning multiple tracks" />
      <div>
        Cells can span multiple columns (<code>columnSpan</code>) and/or rows (
        <code>rowSpan</code>). A boundary cannot be resized alongside of a cell
        that spans across it, although it can still be resized elsewhere.
      </div>
      <Code html={SpansHTML} />
      <Grid className="h-60!" columns={3} rows={3}>
        <Cell row={0} column={0} columnSpan={3}>
          header
        </Cell>
        <Cell row={1} column={0} rowSpan={2}>
          sidebar
        </Cell>
        <Cell row={1} column={1}>
          A
        </Cell>
        <Cell row={1} column={2}>
          B
        </Cell>
        <Cell row={2} column={1} columnSpan={2}>
          footer
        </Cell>
      </Grid>
      <Header section="Grid layouts" title="Size constraints" />
      <div>
        Columns and rows support the same size constraints as panels (e.g.{" "}
        <code>minSize</code>, <code>maxSize</code>, <code>defaultSize</code>,
        and <code>collapsible</code>).
      </div>
      <Code html={ConstraintsHTML} />
      <Grid
        className="h-60!"
        columns={[
          { id: "nav", defaultSize: "25%", minSize: 100, collapsible: true },
          { id: "main", minSize: "30%" }
        ]}
        rows={[
          { id: "content" },
          { id: "console", defaultSize: 100, minSize: 50 }
        ]}
      >
        <Cell row={0} column={0} rowSpan={2}>
          nav
        </Cell>
        <Cell row={0} column={1}>
          main
        </Cell>
        <Cell row={1} column={1}>
          console
        </Cell>
      </Grid>
      <Header section="Grid layouts" title="Separators" />
      <div>
        Like <code>Separator</code>s within a <code>Group</code>,{" "}
        <code>GridSeparator</code>s are optional but recommended because they
        make the grid accessible to keyboard users. Separators can span all
        tracks (the default) or a subset of them (using <code>rowStart</code>/
        <code>rowSpan</code> or <code>columnStart</code>/<code>columnSpan</code>
        ).
      </div>
      <Code html={SeparatorsHTML} />
      <Grid className="h-60!" columns={2} rows={2}>
        <Cell row={0} column={0}>
          A
        </Cell>
        <Cell row={0} column={1}>
          B
        </Cell>
        <Cell row={1} column={0}>
          C
        </Cell>
        <Cell row={1} column={1}>
          D
        </Cell>
        <GridSeparator column={1} />
        <GridSeparator row={1} />
      </Grid>
      <Header section="Grid layouts" title="Imperative API" />
      <div>
        Use the <code>gridRef</code> prop to get or set the layout, or to
        resize, collapse, or expand individual tracks.
      </div>
      <Code html={ImperativeApiHTML} />
    </Box>
  );
}

function Grid({ className, ...rest }: GridProps) {
  return <GridExternal className={cn("gap-2 sm:gap-1", className)} {...rest} />;
}

function Cell({ children, className, ...rest }: PropsWithChildren<CellProps>) {
  return (
    <CellExternal
      className={cn("bg-slate-800 rounded rounded-md", className)}
      {...rest}
    >
      <PanelText>{children}</PanelText>
    </CellExternal>
  );
}

function GridSeparator({ className, ...rest }: GridSeparatorProps) {
  return (
    <GridSeparatorExternal
      className={cn(
        "rounded rounded-xs",
        "bg-slate-600 [&[data-separator='hover']]:bg-slate-500 [&[data-separator='active']]:bg-slate-400 [&[data-separator='focus']]:bg-sky-400",
        rest.column !== undefined ? "w-4 sm:w-2" : "h-4 sm:h-2",
        className
      )}
      {...rest}
    />
  );
}
