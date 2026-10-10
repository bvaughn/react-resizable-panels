# Changelog

## 4.14.4

- Fix pointer events in one document affecting groups mounted in another (e.g. a popup window). The resize cursor is now only shown in the document that contains the active group. - [#762](https://github.com/bvaughn/react-resizable-panels/pull/762)
- Fix an error thrown by an `onLayoutChange`, `onLayoutChanged`, or `onResize` callback leaving a drag stuck in the active state or preventing other groups from being updated. The error is now re-thrown once all groups have been updated. - [#763](https://github.com/bvaughn/react-resizable-panels/pull/763)

## 4.14.3

- Fix drags interrupted by `"pointercancel"`, `"lostpointercapture"`, or the window losing focus (e.g. Alt/Cmd+Tab) staying active until the next pointer event. The drag now ends and commits the current layout. - [#761](https://github.com/bvaughn/react-resizable-panels/pull/761)

## 4.14.2

- Fix constraints derived from stale panel and separator order by re-sorting them first. - [#759](https://github.com/bvaughn/react-resizable-panels/pull/759)

## 4.14.1

- Fix constraints applied because of a `Group` size change (e.g. a pixel-based `minSize` when the window is small) permanently altering the layout. The requested layout is now restored once the constraint no longer applies. - [#720](https://github.com/bvaughn/react-resizable-panels/issues/720)
  - Add a `requestedLayout` attribute to the `onLayoutChanged` meta. `useDefaultLayout` and `useDefaultGridLayout` persist this value instead of the constrained layout.

## 4.14.0

- Add `Grid`, `Cell`, and `Gridline` components for resizable two-dimensional layouts:
  - Columns and rows support the same size constraints as `Panel`s (e.g. min/max size, collapsible).
  - Cells can span multiple columns and/or rows.
  - Dragging where column and row boundaries intersect resizes both axes.
  - `Gridline`s (optional, like `Separator`s) can span a subset of tracks to avoid spanning cells.
- Add `useDefaultGridLayout`, `useGridRef`, and `useGridCallbackRef` hooks.

## 4.13.3

- Fix a `Separator` behind a modal `<dialog>` being draggable. - [#755](https://github.com/bvaughn/react-resizable-panels/pull/755)

## 4.13.2

- Fix `Separator` retaining focus after a drag. - [#751](https://github.com/bvaughn/react-resizable-panels/issues/751)
- Fix `Panel` order in environments like jsdom with invalid `offset` values. - [#753](https://github.com/bvaughn/react-resizable-panels/pull/753)

## 4.13.1

- Bug fixes: - [#750](https://github.com/bvaughn/react-resizable-panels/pull/750)
  - Fix reordered layout keys mapping to the wrong constraints by matching layout values to panel IDs.
  - Fix an edge case `"Matching panels not found"` error by preserving keyboard mappings for disabled separators.
  - Fix the default layout being ignored when an initially hidden group becomes visible.
  - Calculate the available group size once per hit-testing pass instead of once per hit region.
  - Fix `onLayoutChanged` not firing when pressing elsewhere on the page or resizing another group.

## 4.13.0

- Add a customizable resize preview mode. - [#746](https://github.com/bvaughn/react-resizable-panels/issues/746)
- Add a configurable collapse threshold to `Panel`. - [#749](https://github.com/bvaughn/react-resizable-panels/pull/749)

## 4.12.4

- Fix capturing the pointer for a detached `Separator`. - [#743](https://github.com/bvaughn/react-resizable-panels/issues/743)
- Fix `Separator` ARIA values to use the correct panel indices. - [#741](https://github.com/bvaughn/react-resizable-panels/issues/741)

## 4.12.3

- Guard `CSSStyleSheet` construction to avoid throwing in unsupported environments. - ([leo-yang-qiong](https://github.com/leo-yang-qiong) - [#730](https://github.com/bvaughn/react-resizable-panels/pull/730))
- Fix the equality check for derived `Panel` constraints. - [#736](https://github.com/bvaughn/react-resizable-panels/pull/736)
- Fix orphaned groups in a `"pointerup"` edge case. - ([waterWang](https://github.com/waterWang) - [#732](https://github.com/bvaughn/react-resizable-panels/pull/732))

## 4.12.2

- Update inline documentation to clarify size units. - [#726](https://github.com/bvaughn/react-resizable-panels/issues/726)

## 4.12.1

- Fix a context menu event (right click) occurring while a pointer resize is active. - [#723](https://github.com/bvaughn/react-resizable-panels/issues/723)

## 4.12.0

- Pass meta info to the `onLayoutChanged` callback indicating whether the resize was triggered by direct user input (keyboard or mouse). - [#716](https://github.com/bvaughn/react-resizable-panels/pull/716)
- Add an `onlySaveAfterUserInteractions` option to the `useDefaultLayout` hook to only save layouts when directly triggered by user interactions.

## 4.11.2

- Fix rem-based sizes to be calculated relative to the owner document (not body). - [#719](https://github.com/bvaughn/react-resizable-panels/pull/719)

## 4.11.1

- Fix an edge case SSR bug for panels with `defaultSize={0}`. - [#715](https://github.com/bvaughn/react-resizable-panels/pull/715)

## 4.11.0

- Support the `:focus-visible` pseudo-class for `Separator`. - [#712](https://github.com/bvaughn/react-resizable-panels/issues/712)
- Fix edge cases when collapsing the last panel. - [#703](https://github.com/bvaughn/react-resizable-panels/pull/703)
- Improve legacy browser support for global stylesheets. - [#711](https://github.com/bvaughn/react-resizable-panels/issues/711)

## 4.10.0

- Add `data-separator="focus"` state for `Separator` elements for more consistent custom CSS styles. - [#705](https://github.com/bvaughn/react-resizable-panels/pull/705)

## 4.9.0

- Add `disableDoubleClick` prop to `Separator` to enable turning _off_ the double-click size reset behavior. - [#702](https://github.com/bvaughn/react-resizable-panels/pull/702)

## 4.8.0

- Automatically migrate legacy layouts in the `useDefaultLayout` hook to the version 4 format. See issue [#605](https://github.com/bvaughn/react-resizable-panels/issues/605) for details on how this works. - [#699](https://github.com/bvaughn/react-resizable-panels/pull/699)

## 4.7.6

- Replace `Panel` `aria-disabled` attribute with `data-disabled`. - [#698](https://github.com/bvaughn/react-resizable-panels/pull/698)

## 4.7.5

- Improve server rendering support for the `defaultSize` prop. - [#696](https://github.com/bvaughn/react-resizable-panels/pull/696)

## 4.7.4

- Fix an edge case bug with pointer event capture. - [#689](https://github.com/bvaughn/react-resizable-panels/pull/689)

## 4.7.3

- Support non-percentage sizes in the imperative `Panel` API. - [#690](https://github.com/bvaughn/react-resizable-panels/pull/690)

## 4.7.2

- Don't scroll the separator when setting focus. - [#683](https://github.com/bvaughn/react-resizable-panels/pull/683)

## 4.7.1

- Change default overflow styles to support shadows. - [#678](https://github.com/bvaughn/react-resizable-panels/pull/678)

## 4.7.0

- Add `groupResizeBehavior` prop to `Panel`, enabling panels to retain their current size (in pixels) when the parent `Group` is resized. - [#677](https://github.com/bvaughn/react-resizable-panels/pull/677)

## 4.6.5

- Check for undefined `adoptedStyleSheets` (to better support environments like jsdom). - [#670](https://github.com/bvaughn/react-resizable-panels/pull/670)
- Fix the in-memory layout cache not being updated when a group is resized by double-clicking on a separator. - [#671](https://github.com/bvaughn/react-resizable-panels/pull/671)

## 4.6.4

- Fix resize actions sometimes "jumping" on touch devices. - [#664](https://github.com/bvaughn/react-resizable-panels/pull/664), [#665](https://github.com/bvaughn/react-resizable-panels/pull/665)

## 4.6.3

- Fix the project logo not displaying in the README in Firefox.

## 4.6.2

- Guard `Group` against layouts with mis-ordered `Panel` id keys. - [#660](https://github.com/bvaughn/react-resizable-panels/pull/660)

## 4.6.1

- Imperative `Panel` and `Group` APIs ignore `disabled` status when resizing panels. This is an explicit override of the _disabled_ state and is required to support conditionally disabled groups. - [#658](https://github.com/bvaughn/react-resizable-panels/pull/658)
- Don't set a `cursor: not-allowed` style on `Separator` if the parent `Group` has cursors disabled. - [#658](https://github.com/bvaughn/react-resizable-panels/pull/658)

## 4.6.0

- Allow `Panel` and `Separator` components to be disabled. - [#657](https://github.com/bvaughn/react-resizable-panels/pull/657)

## 4.5.9

- Replace `useForceUpdate` with `useSyncExternalStore` to avoid swallowing `"click"` events in certain cases. - [#649](https://github.com/bvaughn/react-resizable-panels/pull/649)
- Fix imperative `Group` method `setLayout` not persisting the layout to the in-memory cache. - [#654](https://github.com/bvaughn/react-resizable-panels/pull/654)
- Re-enable the collapsible panel fix after fixing another reported issue. - [#652](https://github.com/bvaughn/react-resizable-panels/pull/652)

## 4.5.8

- Disable the change to collapsible panel behavior that was originally made in [#635](https://github.com/bvaughn/react-resizable-panels/pull/635) due to another reported regression. - [#651](https://github.com/bvaughn/react-resizable-panels/pull/651)

## 4.5.7

- Re-enable the collapsible `Panel` change from 4.5.3 that was disabled in 4.5.6. - [#646](https://github.com/bvaughn/react-resizable-panels/pull/646)
- Fix `Separator` hover state not being reset on `Document` `"pointerout"`. - [#648](https://github.com/bvaughn/react-resizable-panels/pull/648)

## 4.5.6

- Disable the change to collapsible panel behavior that was originally made in [#635](https://github.com/bvaughn/react-resizable-panels/pull/635). - [#644](https://github.com/bvaughn/react-resizable-panels/pull/644)

## 4.5.5

- Remove the `aria-orientation` attribute from the root `Group` element, as this was invalid according to the ARIA spec. For more information see the discussion on issue [#640](https://github.com/bvaughn/react-resizable-panels/issues/640). - [#641](https://github.com/bvaughn/react-resizable-panels/pull/641)
- Fix a collapsible `Panel` regression introduced in 4.5.3. - [#642](https://github.com/bvaughn/react-resizable-panels/pull/642)

## 4.5.4

- Avoid unnecessary `Panel` re-renders in response to mouse-hover state. - [#638](https://github.com/bvaughn/react-resizable-panels/pull/638)

## 4.5.3

- Expand pre-collapsed panels if dragged past the halfway point for more consistent collapse/expand behavior. - [#635](https://github.com/bvaughn/react-resizable-panels/pull/635)
- Fix a potential CSS overflow bug by setting `Panel` `max-width` and `max-height` to 100%. - [#631](https://github.com/bvaughn/react-resizable-panels/pull/631)

## 4.5.2

- Decrease the default hit target size for `Separator` and `Panel` edges, and make it configurable via a new `Group` prop. - [#626](https://github.com/bvaughn/react-resizable-panels/pull/626)

## 4.5.1

- Fix cursors in Safari by falling back to alternate CSS cursor styles: - [#624](https://github.com/bvaughn/react-resizable-panels/pull/624)

| Safari | Chrome, Firefox |
| :--- | :--- |
| `grab` | `move` |
| `col-resize` | `ew-resize` |
| `row-resize` | `ns-resize` |

## 4.5.0

- Replace `Separator` and `Panel` edge hit-area padding with a minimum size threshold based on [Apple's user interface guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility). Separators that are large enough will no longer be padded; separators that are too small (or panels without separators) will more or less function like before. This should not have much of a user-facing impact other than an increase in the click target area. (Previously I was not padding enough, as per Apple's guidelines.) - [#616](https://github.com/bvaughn/react-resizable-panels/pull/616)
- Reset a `Panel` to its default size when its associated `Separator` is double-clicked (see video below). Double-clicking has no effect on panels without default sizes. - [#615](https://github.com/bvaughn/react-resizable-panels/pull/615), [#620](https://github.com/bvaughn/react-resizable-panels/pull/620)
- Fix sizing of panels within vertical groups in Safari. - [#622](https://github.com/bvaughn/react-resizable-panels/pull/622)
- Fix `adoptedStyleSheets` being overridden. - [#618](https://github.com/bvaughn/react-resizable-panels/pull/618)

Demo of double-clicking on a separator:

https://github.com/user-attachments/assets/f19f6c5e-d290-455e-9bad-20e5038c3508

## 4.4.2

- Fix calculated cursor style when `"pointermove"` event has low-precision/rounded `clientX` and `clientY` values. - [#610](https://github.com/bvaughn/react-resizable-panels/pull/610)

## 4.4.1

- Fix collapsible `Panel` not treating `defaultSize={0}` as _collapsed_ on mount. - [#600](https://github.com/bvaughn/react-resizable-panels/pull/600)

## 4.4.0

- Add `onLayoutChanged` prop to `Group`. - [#599](https://github.com/bvaughn/react-resizable-panels/pull/599)

For layout changes caused by pointer events, this method is not called until the pointer has been released. This callback should be used if you're doing something like saving a layout as it is called less frequently than the previous approach.

The `useDefaultLayout` hook has also been updated to use this callback (though it will continue to support the old callback as well, with a `@deprecation` tag).

## 4.3.3

- Don't call `event.preventDefault()` on `"pointerup"` unless a handle was actively dragged. - [#595](https://github.com/bvaughn/react-resizable-panels/pull/595)

> [!NOTE]
> This change also fixes a text selection bug that impacted Windows users ([#574](https://github.com/bvaughn/react-resizable-panels/issues/574))

## 4.3.2

- Move the `flex-grow` `Panel` style to an inline value instead of a CSS variable defined on the parent `Group` to improve rendering performance. This significantly reduces the negative impact from forced reflow.

## 4.3.1

- Replace `"unset"` styles with safer override values. - [#588](https://github.com/bvaughn/react-resizable-panels/pull/588)
- Use capture phase for `"pointerdown"` and `"pointerup"` events. This is necessary for compatibility with certain UI libraries like Blueprint JS. - [#589](https://github.com/bvaughn/react-resizable-panels/pull/589)
- Read `Panel` pixel size using `offsetWidth`/`offsetHeight` rather than `inlineSize` to avoid an edge case bug with `ResizeObserver`. - [#590](https://github.com/bvaughn/react-resizable-panels/pull/590)

## 4.3.0

- Set default `width`, `height`, and `overflow` styles on `Group` (these can be overridden using the `style` prop). - [#583](https://github.com/bvaughn/react-resizable-panels/pull/583)
- Only call `event.preventDefault` for drag interactions with the primary button. - [#582](https://github.com/bvaughn/react-resizable-panels/pull/582)
- Refine TS types for `useGroupRef` and `usePanelRef` to include `| null` to increase compatibility with older React versions.
- Update TSDoc comments for `Panel` and `Separator` components.

## 4.2.2

- Default the `useDefaultLayout` hook `storage` param to `localStorage` if undefined.
- Fix ambiguous type for `Panel` prop `onResize` that impacted certain TypeScript versions.

## 4.2.1

- Add `displayName` property to `Group`, `Panel`, and `Separator` components for better debugging experience. - [2a6b03f](https://github.com/bvaughn/react-resizable-panels/commit/2a6b03f67d7d8fea8483a6a69bcdaebbe1b18a7a)
- Handle newly registered `Panel` and `Separator` components during `Group` mount so that user code can safely call imperative APIs earlier. - [#577](https://github.com/bvaughn/react-resizable-panels/pull/577)

## 4.2.0

- Add `prevPanelSize` param to `onResize` callback to help simplify collapse/expand detection. - [#573](https://github.com/bvaughn/react-resizable-panels/pull/573)

## 4.1.1

- Update TS types to better reflect that `Separator` attributes `role` and `tabIndex` cannot be overridden using props. - [#571](https://github.com/bvaughn/react-resizable-panels/pull/571)

## 4.1.0

- Support saving and restoring multiple `Panel` layouts in the `useDefaultLayout` hook. - [#567](https://github.com/bvaughn/react-resizable-panels/pull/567)
- Fix race in `useGroupRef` and `usePanelRef` hooks. - [#568](https://github.com/bvaughn/react-resizable-panels/pull/568)

## 4.0.16

- Fix `Panel` `expand()` API not restoring the pre-collapse size. - [#563](https://github.com/bvaughn/react-resizable-panels/pull/563)
- Add guard for unexpected `defaultView` value seemingly returned by some dev environments. - [#564](https://github.com/bvaughn/react-resizable-panels/pull/564)

## 4.0.15

- Ignore `defaultLayout` when keys don't match `Panel` ids. - [#556](https://github.com/bvaughn/react-resizable-panels/pull/556)

## 4.0.14

- Allow resizable panels to be rendered into a different Window (e.g. popup or frame) by accessing globals through `element.ownerDocument.defaultView`. - [#555](https://github.com/bvaughn/react-resizable-panels/pull/555)

## 4.0.13

- Deprecate the `useDefaultLayout` `groupId` param in favor of `id` to avoid confusion (there is no actual requirement for the `Group` to have a matching id).

## 4.0.12

- Debounce `useDefaultLayout` calls to `storage.setItem` by 150ms. - [#552](https://github.com/bvaughn/react-resizable-panels/pull/552)

```ts
// To opt out of this change
useDefaultLayout({
  debounceSaveMs: 0,
  groupId: "test-group-id",
  storage: localStorage,
})
```

> [!NOTE]
> Some may consider this a breaking change, considering the default value is 150ms rather than 0ms. I think in practice this should only impact unit tests which can be easily fixed by overriding the default (as shown above) or by using fake timers.
>
> Changes like this are often judgement calls, but I think on balance it's better to correct my initial oversight of not debouncing this by default.

## 4.0.11

- Fix an edge case bug with panel constraints not being properly invalidated after resize. - [8604491](https://github.com/bvaughn/react-resizable-panels/commit/8604491)

## 4.0.10

- Expand fixed-size element support. - [#551](https://github.com/bvaughn/react-resizable-panels/pull/551)

## 4.0.9

- Fix clicks on higher `z-index` elements (e.g. modals) triggering separators behind them. - [#542](https://github.com/bvaughn/react-resizable-panels/pull/542)
- Don't re-mount `Group` when `defaultLayout` or `disableCursor` props change. - [#547](https://github.com/bvaughn/react-resizable-panels/pull/547)
- Gracefully handle `Panel` id changes. - [#548](https://github.com/bvaughn/react-resizable-panels/pull/548)
- Improve DevX when `Group` is within a hidden DOM subtree; defer layout-change events. - [#549](https://github.com/bvaughn/react-resizable-panels/pull/549)

## 4.0.8

- Don't set invalid layouts when `Group` is hidden or has a width/height of 0. - [#541](https://github.com/bvaughn/react-resizable-panels/pull/541)
- Gracefully handle invalid `defaultLayout` value. - [40d4356](https://github.com/bvaughn/react-resizable-panels/commit/40d4356)

## 4.0.7

- Reset `pointer-events` styles after `"pointerup"` event. - [f07bf00](https://github.com/bvaughn/react-resizable-panels/commit/f07bf00)

## 4.0.6

- Account for Flex gap when calculating pointer-move delta %. - [0796644](https://github.com/bvaughn/react-resizable-panels/commit/0796644)

## 4.0.5

- Update docs to make size and layout formats clearer. - [#535](https://github.com/bvaughn/react-resizable-panels/pull/535)

## 4.0.4

- Focus `Separator` on `"pointerdown"`. - [#534](https://github.com/bvaughn/react-resizable-panels/pull/534)
- Improve iOS/Safari resize UX. - [e08fe42](https://github.com/bvaughn/react-resizable-panels/commit/e08fe42195d8ace7e4e62205453be4a5245fefb9)

## 4.0.3

- Fix TS type for `defaultLayout` value returned from `useDefaultLayout`.

## 4.0.2

- Export `GroupImperativeHandle` and `PanelImperativeHandle` types.

## 4.0.1

- Fix pointer resize events near the edge of a window/iframe. - [#530](https://github.com/bvaughn/react-resizable-panels/pull/530)

# 4.0.0

Version 4 of react-resizable-panels offers more flexible size constraints, supporting units as pixels, percentages, REMs/EMs, and more. Support for server-rendering (including Server Components) has also been expanded.

## Migrating from version 3 to 4

Refer to [the docs](https://react-resizable-panels.vercel.app/) for a complete list of props and API methods. Below are some examples of migrating from version 3 to 4, but first a couple of potential questions:

<dl>
<dt>Q: Why'd you rename &lt;component&gt; or &lt;prop&gt;?</dt>
<dd>A: The most likely reason is that I think the new name more closely aligns with web standards like WAI-ARIA and CSS. For example, the <code>PanelResizeHandle</code> component was renamed to <code>Separator</code> to better align with the <a href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/separator_role">ARIA "separator" role</a> and the <code>direction</code> prop was renamed to <code>orientation</code> to better align with the <a href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-orientation">ARIA <code>orientation</code> attribute </a>.</dd>
<dt>Q: Why'd you remove support for &lt;feature&gt;?</dt>
<dd>A: Probably because it wasn't used widely enough to justify the complexity required to maintain it. If it turns out that I'm mistaken, features can always be (re)added but it's more difficult to remove them.</dd>
<dt>Q: Were the <code>onCollapse</code> and <code>onExpand</code> event handlers removed?</dt>
<dd>A: Yes. Use the <code>onResize</code> event handler instead:

```ts
onResize={(nextSize, id, prevSize) => {
  if (prevSize !== undefined) {
    const wasCollapsed = prevSize.asPercentage !== 0;
    const isCollapsed = nextSize.asPercentage === 0;
    if (isCollapsed !== wasCollapsed) {
      // Panel was collapsed or expanded
    }
  }
}}
```
</dd>
</dl>

### Basic usage example

```tsx
// Version 3

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

<PanelGroup direction="horizontal">
  <Panel defaultSize={30} minSize={20}>left</Panel>
  <PanelResizeHandle />
  <Panel defaultSize={30} minSize={20}>right</Panel>
</PanelGroup>

// Version 4

import { Group, Panel, Separator } from "react-resizable-panels";

<Group orientation="horizontal">
  <Panel defaultSize="30%" minSize="20%">left</Panel>
  <Separator />
  <Panel defaultSize="30%" minSize="20%">right</Panel>
</Group>
```

### Persistent layouts using localStorage

```tsx
// Version 3

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

<PanelGroup autoSaveId="unique-group-id" direction="horizontal">
  <Panel>left</Panel>
  <PanelResizeHandle />
  <Panel>right</Panel>
</PanelGroup>

// Version 4

import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";

const { defaultLayout, onLayoutChange } = useDefaultLayout({
  groupId: "unique-group-id",
  storage: localStorage
});

<Group defaultLayout={defaultLayout} onLayoutChange={onLayoutChange}>
  <Panel>left</Panel>
  <Separator />
  <Panel>right</Panel>
</Group>
```

> [!NOTE]
> Refer to [the docs](https://react-resizable-panels.vercel.app/examples/persistent-layout) for examples of persistent layouts with server rendering and server components.

### Conditional panels

```tsx
// Version 3

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

<PanelGroup autoSaveId="unique-group-id" direction="horizontal">
   {showLeftPanel && (
     <>
       <Panel id="left" order={1}>left</Panel>
       <PanelResizeHandle />
     </>
   )}
   <Panel id="center" order={2}>center</Panel>
   {showRightPanel && (
     <>
       <PanelResizeHandle />
       <Panel id="right" order={3}>right</Panel>
     </>
   )}
</PanelGroup>

// Version 4

import { Group, Panel, Separator } from "react-resizable-panels";

<Group>
  {showLeftPanel && (
    <>
      <Panel id="left">left</Panel>
      <Separator />
    </>
  )}
  <Panel id="center">center</Panel>
  {showRightPanel && (
    <>
      <Separator />
      <Panel id="right">right</Panel>
    </>
  )}
</Group>
```

### Imperative APIs

```tsx
// Version 3

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelGroupHandle, ImperativePanelHandle } from "react-resizable-panels";

const panelRef = useRef<ImperativePanelHandle>(null);
const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

<PanelGroup direction="horizontal" ref={panelGroupRef}>
  <Panel ref={panelRef}>left</Panel>
  <PanelResizeHandle />
  <Panel>right</Panel>
</PanelGroup>

// Version 4

import { Group, Panel, Separator, useGroupRef, usePanelRef } from "react-resizable-panels";

const groupRef = useGroupRef();
const panelRef = usePanelRef();

<Group groupRef={groupRef} orientation="horizontal">
  <Panel panelRef={panelRef}>left</Panel>
  <Separator />
  <Panel>right</Panel>
</Group>
```

### Disabling custom cursors

```tsx
// Version 3

import { disableGlobalCursorStyles } from "react-resizable-panels";

disableGlobalCursorStyles();

// Version 4

import { Group, Panel, Separator } from "react-resizable-panels";

<Group disableCursor />
```

## 3.0.6

- Fix a Firefox bug that caused resizing to be interrupted unexpectedly. - [#517](https://github.com/bvaughn/react-resizable-panels/pull/517)

## 3.0.5

- Fix a size precision regression from 2.0.17. - [#512](https://github.com/bvaughn/react-resizable-panels/pull/512)

## 3.0.4

- Support custom cursors. - [#503](https://github.com/bvaughn/react-resizable-panels/pull/503)

## 3.0.3

- Fix compatibility with Cloudflare Workers. - [#492](https://github.com/bvaughn/react-resizable-panels/pull/492)

## 3.0.2

- Add a fallback for the `HTMLElement` type to better support portal edge cases.

## 3.0.1

- Improve support for Cloudflare Workers and Vercel Functions. - [#479](https://github.com/bvaughn/react-resizable-panels/pull/479)
- Fix `package.json#types` reference. - [#480](https://github.com/bvaughn/react-resizable-panels/pull/480)

# 3.0.0

- Make the module ESM-only in order to better work with modern tooling. - [#478](https://github.com/bvaughn/react-resizable-panels/pull/478)
- Attach `"pointerup"` and `"pointercancel"` listeners to the `ownerDocument` body to better support edge cases like portals being rendered into a child window. - [#475](https://github.com/bvaughn/react-resizable-panels/pull/475)

## 2.1.9

- Only stop propagation for pointer events with targets that are outside of a resize handle. - [#467](https://github.com/bvaughn/react-resizable-panels/pull/467)
- Replace `innerHtml` with `insertRule` to better support [Trusted Types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API). - [#473](https://github.com/bvaughn/react-resizable-panels/pull/473)
- Export typed `DATA_ATTRIBUTES` object to simplify e2e tests. - [#471](https://github.com/bvaughn/react-resizable-panels/pull/471)

## 2.1.8

- Fix `aria-controls` attribute value for auto-generated ids. - [#463](https://github.com/bvaughn/react-resizable-panels/pull/463)
- Fix duplicate type declarations for React. - [#464](https://github.com/bvaughn/react-resizable-panels/pull/464)
- Add `onPointerDown`, `onPointerUp`, and `onClick` callbacks to `PanelResizeHandle` so users can implement double-click. - [#465](https://github.com/bvaughn/react-resizable-panels/pull/465)
- Fix bad `removeEventListener` call that caused pointer state to get broken between pages/routes. - [#466](https://github.com/bvaughn/react-resizable-panels/pull/466)

## 2.1.7

- Fix stacking order checks to also check for `SVGElement`s. - [#427](https://github.com/bvaughn/react-resizable-panels/pull/427)
- Exclude `src` directory from NPM package. - [#433](https://github.com/bvaughn/react-resizable-panels/pull/433)

## 2.1.6

- Replace the `"engines"` block with `"packageManager"`.
- Don't read `document.direction` for RTL detection; use inherited style instead.

## 2.1.5

- Add React v19 to peer deps.

## 2.1.4

- Improve TypeScript HTML tag type generics. - [#407](https://github.com/bvaughn/react-resizable-panels/issues/407)
- Add an edge case check to make sure the resize handle hasn't been unmounted while dragging. - [#410](https://github.com/bvaughn/react-resizable-panels/issues/410)

## 2.1.3

- Fix an edge case bug for a resize handle unmounting while being dragged. - [#402](https://github.com/bvaughn/react-resizable-panels/issues/402)

## 2.1.2

- Suppress invalid layout warning for empty panel groups. - [#396](https://github.com/bvaughn/react-resizable-panels/issues/396)

## 2.1.1

- Fix `onDragging` regression. - [#391](https://github.com/bvaughn/react-resizable-panels/issues/391)
- Fix cursor icon behavior in nested panels. - [#390](https://github.com/bvaughn/react-resizable-panels/issues/390)

## 2.1.0

- Add opt-in support for setting the [`"nonce"` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) for the global cursor style. - [#386](https://github.com/bvaughn/react-resizable-panels/issues/386)
- Support disabling global cursor styles. - [#387](https://github.com/bvaughn/react-resizable-panels/issues/387)

## 2.0.23

- Improve obfuscation for `React.useId` references. - [#382](https://github.com/bvaughn/react-resizable-panels/issues/382)

## 2.0.22

- Force eager layout re-calculation after panel added/removed. - [#375](https://github.com/bvaughn/react-resizable-panels/issues/375)

## 2.0.21

- Handle pointer event edge case with different origin iframes. - [#374](https://github.com/bvaughn/react-resizable-panels/issues/374)

## 2.0.20

- Reset global cursor if an active resize handle is unmounted. - [#313](https://github.com/bvaughn/react-resizable-panels/issues/313)
- Support optional `onFocus` and `onBlur` props for resize handles. - [#370](https://github.com/bvaughn/react-resizable-panels/issues/370)

## 2.0.19

- Add optional `minSize` override param to panel `expand` imperative API.

## 2.0.18

- Don't trigger re-initialization logic for inline object `hitAreaMargins` unless inner values change. - [#342](https://github.com/bvaughn/react-resizable-panels/issues/342)

## 2.0.17

- Prevent pointer events handled by resize handles from triggering elements behind/underneath. - [#338](https://github.com/bvaughn/react-resizable-panels/issues/338)

## 2.0.16

- Replace `.toPrecision()` with `.toFixed()` to avoid undesirable layout shift. - [#323](https://github.com/bvaughn/react-resizable-panels/issues/323)

## 2.0.15

- Better account for high-precision sizes with `onCollapse` and `onExpand` callbacks. - [#325](https://github.com/bvaughn/react-resizable-panels/issues/325)

## 2.0.14

- Better account for high-precision `collapsedSize` values. - [#325](https://github.com/bvaughn/react-resizable-panels/issues/325)

## 2.0.13

- Fix potential cycle in stacking-order logic for an unmounted node. - [#317](https://github.com/bvaughn/react-resizable-panels/issues/317)

## 2.0.12

- Improve resize for edge cases with collapsed panels; intermediate resize states should now fall back to the most recent valid layout rather than the initial layout. - [#311](https://github.com/bvaughn/react-resizable-panels/issues/311)

## 2.0.11

- Fix resize handle cursor hit detection when viewport is scrolled. - [#305](https://github.com/bvaughn/react-resizable-panels/issues/305)

## 2.0.10

- Fix conditional layout edge case. - [#309](https://github.com/bvaughn/react-resizable-panels/issues/309)

## 2.0.9

- Fix Flex stacking context bug. - [#301](https://github.com/bvaughn/react-resizable-panels/issues/301)
- Fix case where pointer event listeners were sometimes added to the document unnecessarily.

## 2.0.8

- Pass `Panel`/`PanelGroup`/`PanelResizeHandle` `id` prop through to the DOM. - [#299](https://github.com/bvaughn/react-resizable-panels/issues/299)
- Make `Panel` attributes `data-panel-collapsible` and `data-panel-size` no longer DEV-only. - [#297](https://github.com/bvaughn/react-resizable-panels/issues/297)

## 2.0.7

- Use `toPrecision` for group default layouts to avoid small layout shifts due to floating point precision differences between initial server rendering and client hydration. - [#295](https://github.com/bvaughn/react-resizable-panels/issues/295)

## 2.0.6

- Replace `useLayoutEffect` usage with SSR-safe wrapper hook. - [#294](https://github.com/bvaughn/react-resizable-panels/issues/294)

## 2.0.5

- Consider [stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context) for resize handle hit detection. - [#291](https://github.com/bvaughn/react-resizable-panels/issues/291)

## 2.0.4

- Fix `PanelResizeHandle` `onDragging` prop to only be called for the handle being dragged. - [#289](https://github.com/bvaughn/react-resizable-panels/issues/289)

## 2.0.3

- Fix resize handle `onDragging` callback. - [#278](https://github.com/bvaughn/react-resizable-panels/issues/278)

## 2.0.2

- Fix an issue where size might not be re-initialized correctly after a panel was hidden by the `unstable_Activity` (previously "Offscreen") API.

## 2.0.1

- Fix a regression introduced in 2.0.0 that caused React `onClick` and `onMouseUp` handlers not to fire.

# 2.0.0

- Support resizing multiple (intersecting) panels at once. - [#274](https://github.com/bvaughn/react-resizable-panels/issues/274)
  - This behavior can be customized using a new `hitAreaMargins` prop, which defaults to a 15 pixel margin for _coarse_ inputs and a 5 pixel margin for _fine_ inputs.

## 1.0.10

- Fix an edge case constraints check bug that could cause a collapsed panel to re-expand unnecessarily. - [#273](https://github.com/bvaughn/react-resizable-panels/issues/273)

## 1.0.9

- Default the DOM util methods scope param to `document`. - [#262](https://github.com/bvaughn/react-resizable-panels/issues/262)
- Revalidate a `Panel`'s size when its pixel constraints are updated. - [#266](https://github.com/bvaughn/react-resizable-panels/issues/266)

## 1.0.8

- Update component signature to declare `ReactElement` return type (rather than `ReactNode`). - [#256](https://github.com/bvaughn/react-resizable-panels/issues/256)
- Update `Panel` dev warning to avoid warning when `defaultSize === collapsedSize` for collapsible panels. - [#257](https://github.com/bvaughn/react-resizable-panels/issues/257)
- Support shadow dom by removing direct references to / dependencies on the root `document`. - [#204](https://github.com/bvaughn/react-resizable-panels/issues/204)

## 1.0.7

- Narrow `tagName` prop to only allow `HTMLElement` names (rather than the broader `Element` type). - [#251](https://github.com/bvaughn/react-resizable-panels/issues/251)

## 1.0.6

- Export internal DOM helper methods.

## 1.0.5

- Fix a server rendering regression. Panels now render with their `defaultSize` during initial mount (if one is specified). This allows server-rendered components to store the most recent size in a cookie and use that value as the default for subsequent page visits. - [#240](https://github.com/bvaughn/react-resizable-panels/issues/240)

## 1.0.4

- Fix an edge case for the `isCollapsed` panel method. Previously an uninitialized `collapsedSize` value was not being initialized to `0`, which caused `isCollapsed` to incorrectly report `false` in some cases.

## 1.0.3

- Remember most recently expanded panel size in local storage. - [#234](https://github.com/bvaughn/react-resizable-panels/issues/234)

## 1.0.2

- Change local storage key for persisted sizes to avoid restoring pixel-based sizes. - [#233](https://github.com/bvaughn/react-resizable-panels/issues/233)

## 1.0.1

- Guard against saving an incorrect panel layout to local storage.

# 1.0.0

- Remove support for pixel-based `Panel` constraints (props like `defaultSizePercentage` should now be `defaultSize`).
- Replace `dataAttributes` prop with `...rest` prop that supports all HTML attributes.

## 0.0.63

- Change default (not-yet-registered) `Panel` `flex-grow` style from 0 to 1.

## 0.0.62

- Guard against invalid sizes in expand/collapse edge cases. - [#220](https://github.com/bvaughn/react-resizable-panels/issues/220)

## 0.0.61

- Better support the unstable Offscreen/Activity API.

## 0.0.60

- Better support imperative API usage from mount effects.
- Better support strict effects mode.
- Better guard against calling `onResize` or `onLayout` more than once.

## 0.0.59

- Support imperative panel API usage on-mount.
- Make `PanelGroup` bailout condition smarter (don't bail out for empty groups unless pixel constraints are used).
- Improve window splitter compatibility by better handling `"Enter"` key.

## 0.0.58

- Change group layout to more thoroughly distribute resize delta to support more flexible group size configurations.
- Add data attribute support to `Panel`, `PanelGroup`, and `PanelResizeHandle`.
- Update API documentation to reflect changed imperative API method names.
- Update `PanelOnResize` TypeScript def to reflect that the previous size param is `undefined` the first time it is called.

## 0.0.57

- Fix DEV conditional error that broke data attributes (and selectors). - [#207](https://github.com/bvaughn/react-resizable-panels/pull/207)

## 0.0.56

Support a mix of percentage and pixel based units at the `Panel` level:

```jsx
<Panel defaultSizePixels={100} minSizePercentage={20} maxSizePercentage={50} />
```

> [!NOTE]
> Pixel units require the use of a `ResizeObserver` to validate. Percentage based units are recommended when possible.

### Example migrating panels with percentage units

<table>
  <thead>
    <tr>
      <th>v55</th>
      <th>v56</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="jsx">
&lt;Panel
  defaultSize={25}
  minSize={10}
  maxSize={50}
/&gt;
        </pre>
      </td>
      <td>
        <pre lang="jsx">
&lt;Panel
  defaultSizePercentage={25}
  minSizePercentage={10}
  maxSizePercentage={50}
/&gt;
        </pre>
      </td>
    </tr>
  </tbody>
</table>

### Example migrating panels with pixel units

<table>
  <thead>
    <tr>
      <th>v55</th>
      <th>v56</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <pre lang="jsx">
&lt;PanelGroup
  direction="horizontal"
  units="pixels"
&gt;
  &lt;Panel minSize={100} maxSize={200} /&gt;
  &lt;PanelResizeHandle /&gt;
  &lt;Panel /&gt;
&lt;/PanelGroup&gt;
        </pre>
      </td>
      <td>
        <pre lang="jsx">
&lt;PanelGroup direction="horizontal"&gt;
  &lt;Panel
    minSizePixels={100}
    maxSizePixels={200}
  /&gt;
  &lt;PanelResizeHandle /&gt;
  &lt;Panel /&gt;
&lt;/PanelGroup&gt;
        </pre>
      </td>
    </tr>
  </tbody>
</table>

For a complete list of supported properties and example usage, refer to the docs.

## 0.0.55

- Add `units` prop to `PanelGroup` to support pixel-based panel size constraints.

This prop defaults to "percentage" but can be set to "pixels" for static, pixel based layout constraints.

This can be used to enable pixel-based min/max and default size values, e.g.:

```jsx
<PanelGroup direction="horizontal" units="pixels">
  {/* Will be constrained to 100-200 pixels (assuming group is large enough to permit this) */}
  <Panel minSize={100} maxSize={200} />
  <PanelResizeHandle />
  <Panel />
  <PanelResizeHandle />
  <Panel />
</PanelGroup>
```

Imperative API methods are also able to work with either pixels or percentages now. They default to whatever units the group has been configured to use, but can be overridden with an additional, optional parameter, e.g.

```ts
panelRef.resize(100, "pixels");
panelGroupRef.setLayout([25, 50, 25], "percentages");

// Works for getters too, e.g.
const percentage = panelRef.getSize("percentages");
const pixels = panelRef.getSize("pixels");

const layout = panelGroupRef.getLayout("pixels");
```

## 0.0.54

- Add a development warning to `PanelGroup` for conditionally-rendered `Panel`(s) that don't have `id` and `order` props. - [#172](https://github.com/bvaughn/react-resizable-panels/issues/172)
- Use package exports to select between node (server-rendering) and browser (client-rendering) bundles. - [#156](https://github.com/bvaughn/react-resizable-panels/pull/156)

## 0.0.53

- Fix edge case race condition for `onResize` callbacks during initial mount.

## 0.0.52

- Add `Panel.collapsedSize` property to allow panels to be collapsed to custom, non-0 sizes. - [#162](https://github.com/bvaughn/react-resizable-panels/issues/162)
- Fix `onResize` not being called for the initial `Panel` size when there is no `onLayout` prop. - [#161](https://github.com/bvaughn/react-resizable-panels/pull/161)

## 0.0.51

- Call `onResize` and `onCollapse` props in response to `PanelGroup.setLayout`. - [#154](https://github.com/bvaughn/react-resizable-panels/issues/154)
- Call `onResize` when the number of panels in a group changes due to conditional rendering. - [#123](https://github.com/bvaughn/react-resizable-panels/issues/123)

## 0.0.50

- Improve panel size validation in `PanelGroup`.

## 0.0.49

- Improve development warnings and props validation checks in `PanelGroup`.

## 0.0.48

- Build release bundle with Preconstruct. - [#148](https://github.com/bvaughn/react-resizable-panels/pull/148)

## 0.0.47

- Mimic VS Code behavior by collapsing a panel if it's smaller than half of its min-size.

## 0.0.46

- Avoid accessing default storage (`localStorage`) during server rendering initialization, and avoid throwing an error in browsers that have 3rd party cookies/storage disabled.

## 0.0.45

- Avoid server rendering layout shift by using `defaultSize` to set initial `flex-grow` style.
- Warn if `Panel` is server-rendered without a `defaultSize` prop.
- Support RTL layouts. - [#135](https://github.com/bvaughn/react-resizable-panels/issues/135)

## 0.0.44

- Avoid re-registering `Panel` when props change. This should reduce the number of scenarios requiring the `order` prop. - [#142](https://github.com/bvaughn/react-resizable-panels/pull/142)

## 0.0.43

- Add imperative `getLayout` API to `PanelGroup`.
- Fix edge case bug where simultaneous `localStorage` updates to multiple saved groups would drop some values. - [#139](https://github.com/bvaughn/react-resizable-panels/pull/139)

## 0.0.42

- Change cursor style from `col-resize`/`row-resize` to `ew-resize`/`ns-resize` to better match cursor style at edges of a panel.

## 0.0.41

- Add imperative `setLayout` API for `PanelGroup`.

## 0.0.40

- Update README docs.

## 0.0.39

- Fix import regression from 0.0.38. - [#118](https://github.com/bvaughn/react-resizable-panels/issues/118)

## 0.0.38

- Improve `Panel` collapse behavior near viewport edges. - [#117](https://github.com/bvaughn/react-resizable-panels/issues/117)
- Call `event.preventDefault` for events handled by `PanelResizeHandle`. - [#115](https://github.com/bvaughn/react-resizable-panels/pull/115)
- Change the `useId` import to avoid triggering errors with older versions of React. (Note this may have an impact on tree-shaking though it is presumed to be minimal, given the small `"react"` package size.) - [#82](https://github.com/bvaughn/react-resizable-panels/issues/82)

## 0.0.37

- Add `onDragging` prop to `PanelResizeHandle` to be notified of when dragging starts/stops. - [#94](https://github.com/bvaughn/react-resizable-panels/issues/94)

## 0.0.36

- Stop disabling `pointer-events` during resize by default. This behavior can be re-enabled using the newly added `PanelGroup` prop `disablePointerEventsDuringResize`. - [#96](https://github.com/bvaughn/react-resizable-panels/issues/96)

## 0.0.35

- Change `browserslist` so compiled module works with CRA 4.0.3 Babel config out of the box. - [#92](https://github.com/bvaughn/react-resizable-panels/pull/92)

## 0.0.34

- Add optional `storage` prop to `PanelGroup` to make it easier to persist layouts somewhere other than `localStorage` (e.g. a cookie). - [#85](https://github.com/bvaughn/react-resizable-panels/issues/85)
- Store some initial state when resizing via mouse/touch events so that any panels that contract will also expand if drag direction is reversed. - [#70](https://github.com/bvaughn/react-resizable-panels/issues/70)
- Don't change the global cursor for layout changes triggered by the keyboard. - [#86](https://github.com/bvaughn/react-resizable-panels/issues/86)
- Fix a small cursor regression introduced in 0.0.33.

## 0.0.33

- Always call `onCollapse` for collapsible `Panel`s on mount regardless of their collapsed state.
- Fix a regression in b5d3ec1 where arrow keys may fail to expand a collapsed panel.

## 0.0.32

- Ensure `Panel` and `PanelGroup` callbacks are always called after mounting. - [#75](https://github.com/bvaughn/react-resizable-panels/issues/75)

## 0.0.31

- Add `getSize` and `getCollapsed` to the imperative API exposed by `Panel`. - [#71](https://github.com/bvaughn/react-resizable-panels/issues/71)
- Remove nullish coalescing operator (`??`) because it caused problems with default create-react-app configuration. - [#67](https://github.com/bvaughn/react-resizable-panels/issues/67), [#72](https://github.com/bvaughn/react-resizable-panels/issues/72)
- Fix edge case when expanding a panel via imperative API that was collapsed by user drag.

## 0.0.30

- Reduce volume/frequency of local storage writes for `PanelGroup`s configured to _auto-save_. - [#68](https://github.com/bvaughn/react-resizable-panels/pull/68)
- Add `onLayout` prop to `PanelGroup` to be called when group layout changes. Note that some form of debouncing is recommended before processing these values (e.g. saving to a database).

## 0.0.29

- Add imperative `collapse`, `expand`, and `resize` methods to `Panel`. - [#58](https://github.com/bvaughn/react-resizable-panels/pull/58)
- Disable `pointer-events` inside of `Panel`s during resize. This avoids edge cases like nested iframes. - [#64](https://github.com/bvaughn/react-resizable-panels/pull/64)
- Improve server rendering check to include `window.document`. This more closely matches React's own check and avoids false positives for environments that alias `window` to some global object. - [#57](https://github.com/bvaughn/react-resizable-panels/pull/57)

## 0.0.28

- Avoid `useLayoutEffect` warning when server rendering. Render panels with default style of `flex: 1 1 auto` during initial render. - [#53](https://github.com/bvaughn/react-resizable-panels/issues/53)

## 0.0.27

- Add `collapsible` and `onCollapse` props to `Panel` to support auto-collapsing panels that resize beyond their `minSize` value (similar to VS Code's panel UX). - [#4](https://github.com/bvaughn/react-resizable-panels/issues/4)

## 0.0.26

- Reduce style recalculation from the resize-in-progress cursor style.

## 0.0.25

- Make the global cursor style reliably override per-element styles while a resize is active (to avoid flickering if you drag over e.g. an anchor element).

## 0.0.24

- Change cursor based on min/max boundaries. - [#49](https://github.com/bvaughn/react-resizable-panels/issues/49)

## 0.0.23

- Add optional `maxSize` prop to `Panel`. - [#40](https://github.com/bvaughn/react-resizable-panels/issues/40)
- Add optional `onResize` prop to `Panel`. This prop can be used (along with `defaultSize`) to persist layouts somewhere externally. - [#41](https://github.com/bvaughn/react-resizable-panels/issues/41)
- Don't cancel resize operations when exiting the window. Only cancel when a `"mouseup"` (or `"touchend"`) event is fired. - [#42](https://github.com/bvaughn/react-resizable-panels/issues/42)

## 0.0.22

- Replace the `"ew-resize"` and `"ns-resize"` cursor styles with `"col-resize"` and `"row-resize"`.

## 0.0.21

- Fix a regression in TypeScript defs introduced in `0.0.20`. - [#39](https://github.com/bvaughn/react-resizable-panels/issues/39)

## 0.0.20

- Add `displayName` to `Panel`, `PanelGroup`, `PanelGroupContext`, and `PanelResizeHandle` to work around ParcelJS scope hoisting renaming.

## 0.0.19

- Add optional `style` and `tagName` props to `Panel`, `PanelGroup`, and `PanelResizeHandle` to simplify custom styling.
- Add `data-panel-group-direction` attribute to `PanelGroup` and `PanelResizeHandle` to simplify custom drag handle styling.

## 0.0.18

- Use `overflow: hidden` style by default for `Panel` and `PanelGroup` to avoid potential scrollbar flickers while resizing.

## 0.0.17

- Fix `Panel` styles to include `flex-basis`, `flex-shrink`, and `overflow` so that their sizes are not unintentionally impacted by their content.

## 0.0.16

- Fix resize handle ARIA attributes to render proper min/max/now values for Window Splitter.
- Ignore up/down arrows for _horizontal_ layouts and left/right arrows for _vertical_ layouts, as per the Window Splitter spec.
- Remove `PanelContext` in favor of adding `data-resize-handle-active` attribute to active resize handles. This attribute can be used to update the style for active handles. - [#36](https://github.com/bvaughn/react-resizable-panels/issues/36)

## 0.0.15

- Use `display: flex` for `PanelGroup` rather than absolute positioning. This provides several benefits: (a) more responsive resizing for nested groups, (b) no explicit `width`/`height` props, and (c) `PanelResizeHandle` components can now be rendered directly within `PanelGroup` (rather than as children of `Panel`s). - [#30](https://github.com/bvaughn/react-resizable-panels/issues/30)

## 0.0.14

- Fix small regression with `autoSaveId` that was introduced with non-deterministic `useId` ids. - [#23](https://github.com/bvaughn/react-resizable-panels/issues/23)

## 0.0.13

- Support server-side rendering (e.g. Next JS) by using `useId` (when available). `Panel` components no longer _require_ a user-provided `id` prop and will also fall back to using `useId` when none is provided. - [#18](https://github.com/bvaughn/react-resizable-panels/issues/18)
- Set `position: relative` style on `PanelGroup` by default, as well as an explicit `height` and `width` style.

## 0.0.12

- Fix an initial "jump" that could occur when dragging started. - [#19](https://github.com/bvaughn/react-resizable-panels/issues/19)
- Stop resize/drag operation on `"contextmenu"` event. - [#20](https://github.com/bvaughn/react-resizable-panels/issues/20)
- Disable text selection while dragging is active (Firefox only). - [#21](https://github.com/bvaughn/react-resizable-panels/issues/21)

## 0.0.11

- Reversing a drag after dragging past the min/max size of a panel will no longer have an effect until the pointer overlaps with the resize handle. (Thanks [davidkpiano](https://github.com/davidkpiano) for the suggestion!)
- Fix resize handles being left in a "focused" state after a touch/mouse event.

## 0.0.10

- Corrupt build artifact. Don't use this version.

## 0.0.9

- Declare "separator" role for `PanelResizeHandle` and implement the recommended ["Window Splitter" pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/). - [#13](https://github.com/bvaughn/react-resizable-panels/issues/13)

## 0.0.8

- Support "touch" events for mobile compatibility. - [#7](https://github.com/bvaughn/react-resizable-panels/issues/7)

## 0.0.7

- Add `PanelContext` with an `activeHandleId` property identifying the resize handle currently being dragged (or `null`). This enables more customized UI/UX when resizing is in progress.

## 0.0.6

- Remove `panelBefore` and `panelAfter` props from `PanelResizeHandle`. `PanelGroup` now infers this based on position within the group. - [#5](https://github.com/bvaughn/react-resizable-panels/issues/5)

## 0.0.5

- Fix TypeScript props type for `PanelGroup`'s `children` prop.

## 0.0.4

- Add optional `order` prop to `Panel` to improve conditional rendering. - [#8](https://github.com/bvaughn/react-resizable-panels/issues/8)

## 0.0.3

- Support conditionally rendering `Panel`s within a group. `PanelGroup` will persist separate layouts for each combination of visible panels. - [#3](https://github.com/bvaughn/react-resizable-panels/issues/3)

## 0.0.2

- Update documentation.

## 0.0.1

- Initial release.
