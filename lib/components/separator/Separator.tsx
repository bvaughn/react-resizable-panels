"use client";

import { GridSeparator } from "../grid/GridSeparator";
import type { GridSeparatorProps } from "../grid/types";
import { GroupSeparator } from "./GroupSeparator";
import type { SeparatorProps } from "./types";

/**
 * In a Grid, specify axis and after to customize an automatically generated boundary.
 *
 * In a Group, separators are not _required_ but they are _recommended_ as they improve keyboard accessibility.
 *
 * ⚠️ Separator elements must be direct DOM children of their parent Group or Grid elements.
 *
 * Separator elements always include the following attributes:
 *
 * ```html
 * <div data-separator data-testid="separator-id-prop" id="separator-id-prop" role="separator">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 *
 * ℹ️ In addition to the attributes shown above, separator also renders all required [WAI-ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role#associated_wai-aria_roles_states_and_properties).
 */
export function Separator(
  props:
    | (SeparatorProps & { axis?: undefined; after?: undefined })
    | GridSeparatorProps
) {
  return props.axis !== undefined ? (
    <GridSeparator {...props} />
  ) : (
    <GroupSeparator {...props} />
  );
}
