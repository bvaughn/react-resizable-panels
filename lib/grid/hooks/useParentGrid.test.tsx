import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Cell, Grid } from "../../index";
import { setDefaultElementBounds } from "../../shared/utils/test/mockBoundingClientRect";
import { createProbe } from "../../shared/utils/test/createProbe";

describe("useParentGrid", () => {
  test("returns null outside of a matching ancestor", () => {
    const probe = createProbe();
    const { Probe } = probe;

    render(<Probe />);

    expect(probe.latest.grid).toBeNull();
  });

  test("returns the nearest Grid", () => {
    setDefaultElementBounds(new DOMRect(0, 0, 100, 100));

    const probe = createProbe();
    const { Probe } = probe;

    render(
      <Grid columns={2} id="grid" rows={2}>
        <Cell column={0} columnSpan={2} id="cell" row={1}>
          <Probe />
        </Cell>
      </Grid>
    );

    expect(probe.latest.grid?.id).toBe("grid");
    expect(probe.latest.grid?.getLayout()).toEqual({
      columns: { 0: 50, 1: 50 },
      rows: { 0: 50, 1: 50 }
    });
    expect(probe.latest.grid?.getTrackByIndex("row", 1).getSize()).toEqual(
      expect.objectContaining({ asPercentage: 50 })
    );
  });
});
