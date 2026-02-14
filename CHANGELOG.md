# Changelog

## Unreleased

- [664](https://github.com/bvaughn/react-resizable-panels/pull/664), [665](https://github.com/bvaughn/react-resizable-panels/pull/665): Resize actions sometimes "jump" on touch devices

## 4.6.3

- Fixed a problem with project logo not displaying correctly in the README for the Firefox browser.

## 4.6.2

- [660](https://github.com/bvaughn/react-resizable-panels/pull/660): `Group` guards against layouts with mis-ordered `Panel` id keys

## 4.6.1

- [658](https://github.com/bvaughn/react-resizable-panels/pull/658): Imperative `Panel` and `Group` APIs ignored `disabled` status when resizing panels; this is an explicit override of the _disabled_ state and is required to support conditionally disabled groups.
- [658](https://github.com/bvaughn/react-resizable-panels/pull/658): `Separator` component does not set a `cursor: not-allowed` style if the parent `Group` has cursors disabled.

## 4.6.0

- [657](https://github.com/bvaughn/react-resizable-panels/pull/657): Allow `Panel` and `Separator` components to be disabled

## 4.5.9

- [649](https://github.com/bvaughn/react-resizable-panels/pull/649): Optimization: Replace `useForceUpdate` with `useSyncExternalStore` to avoid side effect of swallowing "click" events in certain cases
- [654](https://github.com/bvaughn/react-resizable-panels/pull/654): **Bugfix** Imperative `Group` method `setLayout` persists layout to in-memory cache
- [652](https://github.com/bvaughn/react-resizable-panels/pull/652): Re-enable collapsible panel bugfix after fixing another reported issue

## 4.5.8

- [651](https://github.com/bvaughn/react-resizable-panels/pull/651): Disabled the change to collapsible panel behavior that was originally made in [635](https://github.com/bvaughn/react-resizable-panels/pull/635) due to another reported regression

## 4.5.7

- [646](https://github.com/bvaughn/react-resizable-panels/pull/646): Re-enable the collapsible `Panel` from 4.5.3 that was disabled in 4.5.6
- [648](https://github.com/bvaughn/react-resizable-panels/pull/648): **Bugfix**: Reset `Separator` hover-state on `Document` "pointerout"

## 4.5.6

- [644](https://github.com/bvaughn/react-resizable-panels/pull/644): Disabled the change to collapsible panel behavior that was originally made in [635](https://github.com/bvaughn/react-resizable-panels/pull/635)

## 4.5.5

- [641](https://github.com/bvaughn/react-resizable-panels/pull/641): Removed `aria-orientation` role from root `Group` element as this was invalid according to the ARIA spec; (for more information see the discussion on issue [#640](https://github.com/bvaughn/react-resizable-panels/issues/640))
- [642](https://github.com/bvaughn/react-resizable-panels/pull/642): **Bugfix**: Fix collapsible `Panel` regression introduced in 4.5.3

## 4.5.4

- [638](https://github.com/bvaughn/react-resizable-panels/pull/638): `Panel` avoids unnecessary re-renders in response to mouse-hover state.

## 4.5.3

- [635](https://github.com/bvaughn/react-resizable-panels/pull/635): Expand pre-collapsed panels if drug past the halfway point for more consistent collapse/expand behavior.
- [631](https://github.com/bvaughn/react-resizable-panels/pull/631): **Bugfix**: Panels set `max-width` and `max-height` to 100% to fix potential CSS overflow bug.

## 4.5.2

- [626](https://github.com/bvaughn/react-resizable-panels/pull/626): Decrease default hit target size for `Separator` and `Panel` edges; make configurable via a new `Group` prop.

## 4.5.1

- [624](https://github.com/bvaughn/react-resizable-panels/pull/624): **Bugfix**: Fallback to alternate CSS cursor styles for Safari

| Safari | Chrome, Firefox
| :--- | :---
| `grab` | `move`
| `col-resize` | `ew-resize`
| `row-resize` | `ns-resize`

## 4.5.0

- [616](https://github.com/bvaughn/react-resizable-panels/pull/616): Replace `Separator` and `Panel` edge hit-area padding with a minimum size threshold based on [Apple's user interface guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility). Separators that are large enough will no longer be padded; separators that are too small (or panels without separators) will more or less function like before. This should not have much of a user-facing impact other than an increase in the click target area. (Previously I was not padding enough, as per Apple's guidelines.)
- [615](https://github.com/bvaughn/react-resizable-panels/pull/615), [620](https://github.com/bvaughn/react-resizable-panels/pull/620): Double-clicking on a `Separator` resets its associated `Panel` to its default-size (see video below); double-click will have no impact on panels without default sizes
- [622](https://github.com/bvaughn/react-resizable-panels/pull/622): **Bugfix**: Panels within vertical groups are now properly sized in Safari
- [618](https://github.com/bvaughn/react-resizable-panels/pull/618): **Bugfix**: Don't override `adoptedStyleSheets`

Demo of double-clicking on a separator:

https://github.com/user-attachments/assets/f19f6c5e-d290-455e-9bad-20e5038c3508

## 4.4.2

- [610](https://github.com/bvaughn/react-resizable-panels/pull/610): Fix calculated cursor style when `"pointermove"` event is has low-precision/rounded `clientX` and `clientY` values

## 4.4.1

- [600](https://github.com/bvaughn/react-resizable-panels/pull/600): Bugfix: Collapsible `Panel` should treat `defaultSize={0}` as _collapsed_ on mount

## 4.4.0

- [599](https://github.com/bvaughn/react-resizable-panels/pull/599): Add new `onLayoutChanged` prop to `Group`.

For layout changes caused by pointer events, this method is not called until the pointer has been released. This callback should be used if you're doing something like saving a layout as it is called less frequently than the previous approach.

The `useDefaultLayout` hook has also been updated to use this callback (though it will continue to support the old callback as well, with a `@deprecation` tag).

## 4.3.3

- [595](https://github.com/bvaughn/react-resizable-panels/pull/595): Don't call `event.preventDefault()` on "pointerup" unless a handle was actively dragged

> [!NOTE]
> This change also fixes a text selection bug that impacted Windows users (#574)

## 4.3.2

- Moved `flex-grow` `Panel` style to an inline value instead of a CSS variable defined on the parent `Group` to improve rendering performance. (This significantly reduces the negative impact from forced-reflow)

## 4.3.1

- [588](https://github.com/bvaughn/react-resizable-panels/pull/588): Replace `"unset"` styles with safer override values
- [589](https://github.com/bvaughn/react-resizable-panels/pull/589): Use capture phase for `"pointerdown"` and `"pointerup"` events; this is necessary for compatibility with certain UI libraries like Blueprint JS
- [590](https://github.com/bvaughn/react-resizable-panels/pull/590): Read `Panel` pixel size using `offsetWidth`/`offsetHeight` rather than `inlineSize` to avoid an edgecase bug with `ResizeObserver`

## 4.3.0

- [583](https://github.com/bvaughn/react-resizable-panels/pull/583): `Group` component now sets default `width`, `height`, and `overflow` styles; (both can be overridden using the `style` property)
- [582](https://github.com/bvaughn/react-resizable-panels/pull/582): Drag interactions only call `event.preventDefault` for the primary button
- Refine TS types for `useGroupRef` and `usePanelRef` to include `| null` to increase compatibility with older React versions
- Update TSDoc comments for `Panel` and `Separator` components

## 4.2.2

- `useDefaultLayout` hook initializes `storage` param to `localStorage` if undefined.
- Fix ambiguous type for `Panel` prop `onResize` that impacted certain TypeScript versions.

## 4.2.1

- [2a6b03f](https://github.com/bvaughn/react-resizable-panels/commit/2a6b03f67d7d8fea8483a6a69bcdaebbe1b18a7a): Add `displayName` property to `Group`, `Panel`, and `Separator` components for better debugging experience.
- [577](https://github.com/bvaughn/react-resizable-panels/pull/577): `Group` handles newly registered `Panels` + `Separators` during mount so that user code can safely call imperative APIs earlier

## 4.2.0

- [573](https://github.com/bvaughn/react-resizable-panels/pull/573): Add `prevPanelSize` param to `onResize` callback to help simplify collapse/expand detection.

## 4.1.1

- [571](https://github.com/bvaughn/react-resizable-panels/pull/571): Update TS types to better reflect that `Separator` attributes `role` and `tabIndex` cannot be overridden using props.

## 4.1.0

- [567](https://github.com/bvaughn/react-resizable-panels/pull/567): `useDefaultLayout` hook supports saving and restoring multiple Panel layouts
- [568](https://github.com/bvaughn/react-resizable-panels/pull/568): Fix race in `useGroupRef` and `usePanelRef` hooks

## 4.0.16

- [563](https://github.com/bvaughn/react-resizable-panels/pull/563): Panel `expand()` API should restore pre-collapse size
- [564](https://github.com/bvaughn/react-resizable-panels/pull/564): Add guard for unexpected `defaultView` value seemingly returned by some dev environments

## 4.0.15

- [556](https://github.com/bvaughn/react-resizable-panels/pull/556): Ignore `defaultLayout` when keys don't match Panel ids

## 4.0.14

- [555](https://github.com/bvaughn/react-resizable-panels/pull/555): Allow resizable panels to be rendered into a different Window (e.g. popup or frame) by accessing globals through `element.ownerDocument.defaultView`

## 4.0.13

- `useDefaultLayout`: Deprecated `groupId` param in favor of `id` to avoid confusion; (there is no actual requirement for the Group to have a matching id)

## 4.0.12

- [552](https://github.com/bvaughn/react-resizable-panels/pull/552): `useDefaultLayout` now debounces calls to `storage.setItem` by 150ms

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

- [8604491](https://github.com/bvaughn/react-resizable-panels/commit/8604491): Fix edge case bug with panel constraints not being properly invalidated after resize

## 4.0.10

- [#551](https://github.com/bvaughn/react-resizable-panels/pull/551): Expand fixed-size element support

## 4.0.9

- [#542](https://github.com/bvaughn/react-resizable-panels/pull/542): Clicks on higher `z-index` elements (e.g. modals) should not trigger separators behind them
- [#547](https://github.com/bvaughn/react-resizable-panels/pull/547): Don't re-mount Group when `defaultLayout` or `disableCursor` props change
- [#548](https://github.com/bvaughn/react-resizable-panels/pull/548): Bugfix: Gracefully handle `Panel` id changes
- [#549](https://github.com/bvaughn/react-resizable-panels/pull/549): Improve DevX when Group within hidden DOM subtree; defer layout-change events

## 4.0.8

- [#541](https://github.com/bvaughn/react-resizable-panels/pull/541): Don't set invalid layouts when Group is hidden or has a width/height of 0
- [40d4356](https://github.com/bvaughn/react-resizable-panels/commit/40d4356): Gracefully handle invalid `defaultLayout` value

## 4.0.7

- [f07bf00](https://github.com/bvaughn/react-resizable-panels/commit/f07bf00): Reset `pointer-event` styles after "pointerup" event

## 4.0.6

- [0796644](https://github.com/bvaughn/react-resizable-panels/commit/0796644): Account for Flex gap when calculating pointer-move delta %

## 4.0.5

- [#535](https://github.com/bvaughn/react-resizable-panels/pull/535): Updated docs to make size and layout formats clearer

## 4.0.4

- [#534](https://github.com/bvaughn/react-resizable-panels/pull/534): Set focus on `Separator` on "pointerdown"
- [e08fe42](https://github.com/bvaughn/react-resizable-panels/commit/e08fe42195d8ace7e4e62205453be4a5245fefb9): Improve iOS/Safari resize UX

## 4.0.3

- Fixed TS type for `defaultLayout` value returned from `useDefaultLayout`

## 4.0.2

- Export `GroupImperativeHandle` and `PanelImperativeHandle` types.

## 4.0.1

- [#530](https://github.com/bvaughn/react-resizable-panels/pull/530): Edge case bug fix: Account for pointer resize events near edge of window/iframe

# 4.0.0
Version 4 of react-resizable-panels offers more flexible size constraints– supporting units as pixels, percentages, REMs/EMs, and more. Support for server-rendering (including Server Components) has also been expanded.

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
import type { ImperativePanelGroupHandle, ImperativePanelHandle }from "react-resizable-panels";

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

# 3.0.6
- [#517](https://github.com/bvaughn/react-resizable-panels/pull/517): Fixed Firefox bug that caused resizing to be interrupted unexpected

# 3.0.5
- [#512](https://github.com/bvaughn/react-resizable-panels/pull/512): Fixed size precision regression from 2.0.17

# 3.0.4

- [#503](https://github.com/bvaughn/react-resizable-panels/pull/503): Support custom cursors

# 3.0.3

- [#492](https://github.com/bvaughn/react-resizable-panels/pull/492): Fix compatibility with cloudflare workers

# 3.0.2

- Fallback for type of `HTMLElement` to better support portal edge cases

# 3.0.1

- [#479](https://github.com/bvaughn/react-resizable-panels/pull/479): Improve support for Cloudflare Workers and Vercel Functions
- [#480](https://github.com/bvaughn/react-resizable-panels/pull/480): Fixed `package.json#types` reference

# 3.0.0

- [#478](https://github.com/bvaughn/react-resizable-panels/pull/478): Module is ESM-only in order to better work with modern tooling.
- [#475](https://github.com/bvaughn/react-resizable-panels/pull/475): `"pointerup"` and `"pointercancel"` listeners are now attached to the `ownerDocument` body to better support edge cases like portals being rendered into a child window.

# 2.1.9
- [#467](https://github.com/bvaughn/react-resizable-panels/pull/467): Only stop propagate for pointer events with targets that are outside of a resize handle
- [#473](https://github.com/bvaughn/react-resizable-panels/pull/473): Replace `innerHtml` with `insertRule` to better support [Trusted Types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)
- [#471](https://github.com/bvaughn/react-resizable-panels/pull/471): Export typed `DATA_ATTRIBUTES` object to simplify e2e tests.

# 2.1.8

- [#463](https://github.com/bvaughn/react-resizable-panels/pull/463): Fix `aria-controls` attribute value for auto-generated ids
- [#464](https://github.com/bvaughn/react-resizable-panels/pull/464): Fix duplicate type declarations for React
- [#465](https://github.com/bvaughn/react-resizable-panels/pull/465): Add `onPointerDown`, `onPointerUp`, and `onClick` callbacks to `PanelResizeHandle` so users can implement double-click
- [#466](https://github.com/bvaughn/react-resizable-panels/pull/466): Fix bad `removeEventListener` call that caused pointer state to get broken between pages/routes

# 2.1.7

- [#427](https://github.com/bvaughn/react-resizable-panels/pull/427): Stacking order checks also check for `SVGElement`s (bug fix)
- [#433](https://github.com/bvaughn/react-resizable-panels/pull/433): Exclude `src` directory from NPM package

# 2.1.6

- Removed `"engines"` block and replaced with `"packageManager"`
- Don't read `document.direction` for RTL detection; use inherited style instead

## 2.1.5

- Add react v19 to peer deps

## 2.1.4

- Improve TypeScript HTML tag type generics (#407)
- Edge case check to make sure resize handle hasn't been unmounted while dragging (#410)

## 2.1.3

- Edge case bug fix for a resize handle unmounting while being dragged (#402)

## 2.1.2

- Suppress invalid layout warning for empty panel groups (#396)

## 2.1.1

- Fix `onDragging` regression (#391)
- Fix cursor icon behavior in nested panels (#390)

## 2.1.0

- Add opt-in support for setting the [`"nonce"` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) for the global cursor style (#386)
- Support disabling global cursor styles (#387)

## 2.0.23

- Improve obfuscation for `React.useId` references (#382)

## 2.0.22

- Force eager layout re-calculation after panel added/removed (#375)

## 2.0.21

- Handle pointer event edge case with different origin iframes (#374)

## 2.0.20

- Reset global cursor if an active resize handle is unmounted (#313)
- Resize handle supports (optional) `onFocus` or `onBlur` props (#370)

## 2.0.19

- Add optional `minSize` override param to panel `expand` imperative API

## 2.0.18

- Inline object `hitAreaMargins` will not trigger re-initialization logic unless inner values change (#342)

## 2.0.17

- Prevent pointer events handled by resize handles from triggering elements behind/underneath (#338)

## 2.0.16

- Replaced .toPrecision() with .toFixed() to avoid undesirable layout shift (#323)

## 2.0.15

- Better account for high-precision sizes with `onCollapse` and `onExpand` callbacks (#325)

## 2.0.14

- Better account for high-precision `collapsedSize` values (#325)

## 2.0.13

- Fix potential cycle in stacking-order logic for an unmounted node (#317)

## 2.0.12

- Improve resize for edge cases with collapsed panels; intermediate resize states should now fall back to the most recent valid layout rather than the initial layout (#311)

## 2.0.11

- Fix resize handle cursor hit detection when when viewport is scrolled (#305)

## 2.0.10

- Fix conditional layout edge case (#309)

## 2.0.9

- Fix Flex stacking context bug (#301)
- Fix case where pointer event listeners were sometimes added to the document unnecessarily

## 2.0.8

- `Panel`/`PanelGroup`/`PanelResizeHandle`` pass "id" prop through to DOM (#299)
- `Panel` attributes `data-panel-collapsible` and `data-panel-size` are no longer DEV-only (#297)

## 2.0.7

- Group default layouts use `toPrecision` to avoid small layout shifts due to floating point precision differences between initial server rendering and client hydration (#295)

## 2.0.6

- Replace `useLayoutEffect` usage with SSR-safe wrapper hook (#294)

## 2.0.5

- Resize handle hit detection considers [stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context) when determining hit detection (#291)

## 2.0.4

- Fixed `PanelResizeHandle` `onDragging` prop to only be called for the handle being dragged (#289)

## 2.0.3

- Fix resize handle onDragging callback (#278)

## 2.0.2

- Fixed an issue where size might not be re-initialized correctly after a panel was hidden by the `unstable_Activity` (previously "Offscreen") API.

## 2.0.1

- Fixed a regression introduced in 2.0.0 that caused React `onClick` and `onMouseUp` handlers not to fire.

## 2.0.0

- Support resizing multiple (intersecting) panels at once (#274)
This behavior can be customized using a new `hitAreaMargins` prop; defaults to a 15 pixel margin for _coarse_ inputs and a 5 pixel margin for _fine_ inputs.

## 1.0.10

- Fixed edge case constraints check bug that could cause a collapsed panel to re-expand unnecessarily (#273)

## 1.0.9

- DOM util methods scope param defaults to `document` (#262)
- Updating a `Panel`'s pixel constraints will trigger revalidation of the `Panel`'s size (#266)

## 1.0.8

- Update component signature to declare `ReactElement` return type (rather than `ReactNode`) (#256)
- Update `Panel` dev warning to avoid warning when `defaultSize === collapsedSize` for collapsible panels (#257)
- Support shadow dom by removing direct references to / dependencies on the root `document` (#204)

## 1.0.7

- Narrow `tagName` prop to only allow `HTMLElement` names (rather than the broader `Element` type) (#251)

## 1.0.6

- Export internal DOM helper methods.

## 1.0.5

- Fix server rendering regression (#240); Panels will now render with their `defaultSize` during initial mount (if one is specified). This allows server-rendered components to store the most recent size in a cookie and use that value as the default for subsequent page visits.

## 1.0.4

- Edge case bug fix for `isCollapsed` panel method; previously an uninitialized `collapsedSize` value was not being initialized to `0`, which caused `isCollapsed` to incorrectly report `false` in some cases.

## 1.0.3

- Remember most recently expanded panel size in local storage (#234)

## 1.0.2

- Change local storage key for persisted sizes to avoid restoring pixel-based sizes (#233)

## 1.0.1

- Small bug fix to guard against saving an incorrect panel layout to local storage

# 1.0.0

- Remove support for pixel-based Panel constraints; (props like `defaultSizePercentage` should now be `defaultSize`)
- Replaced `dataAttributes` prop with `...rest` prop that supports all HTML attributes

## 0.0.63

- Change default (not-yet-registered) Panel flex-grow style from 0 to 1

## 0.0.62

- Edge case expand/collapse invalid size guard (#220)

## 0.0.61

- Better unstable Offscreen/Activity API.

## 0.0.60

- Better support imperative API usage from mount effects.
- Better support strict effects mode.
- Better checks not to call `onResize` or `onLayout` more than once.

## 0.0.59

- Support imperative panel API usage on-mount.
- Made PanelGroup bailout condition smarter (don't bailout for empty groups unless pixel constraints are used).
- Improved window splitter compatibility by better handling "Enter" key.

## 0.0.58

- Change group layout to more thoroughly distribute resize delta to support more flexible group size configurations.
- Add data attribute support to `Panel`, `PanelGroup`, and `PanelResizeHandle`.
- Update API documentation to reflect changed imperative API method names.
- `PanelOnResize` TypeScript def updated to reflect that previous size param is `undefined` the first time it is called.

## 0.0.57

- [#207](https://github.com/bvaughn/react-resizable-panels/pull/207): Fix DEV conditional error that broke data attributes (and selectors).

## 0.0.56

Support a mix of percentage and pixel based units at the `Panel` level:

```jsx
<Panel defaultSizePixels={100} minSizePercentage={20} maxSizePercentage={50} />
```

> **Note**: Pixel units require the use of a `ResizeObserver` to validate. Percentage based units are recommended when possible.

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

- New `units` prop added to `PanelGroup` to support pixel-based panel size constraints.

This prop defaults to "percentage" but can be set to "pixels" for static, pixel based layout constraints.

This can be used to add enable pixel-based min/max and default size values, e.g.:

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

- [172](https://github.com/bvaughn/react-resizable-panels/issues/172): Development warning added to `PanelGroup` for conditionally-rendered `Panel`(s) that don't have `id` and `order` props
- [156](https://github.com/bvaughn/react-resizable-panels/pull/156): Package exports now used to select between node (server-rendering) and browser (client-rendering) bundles

## 0.0.53

- Fix edge case race condition for `onResize` callbacks during initial mount

## 0.0.52

- [162](https://github.com/bvaughn/react-resizable-panels/issues/162): Add `Panel.collapsedSize` property to allow panels to be collapsed to custom, non-0 sizes
- [161](https://github.com/bvaughn/react-resizable-panels/pull/161): Bug fix: `onResize` should be called for the initial `Panel` size regardless of the `onLayout` prop

## 0.0.51

- [154](https://github.com/bvaughn/react-resizable-panels/issues/154): `onResize` and `onCollapse` props are called in response to `PanelGroup.setLayout`
- [123](https://github.com/bvaughn/react-resizable-panels/issues/123): `onResize` called when number of panels in a group change due to conditional rendering

## 0.0.50

- Improved panel size validation in `PanelGroup`.

## 0.0.49

- Improved development warnings and props validation checks in `PanelGroup`.

## 0.0.48

- [148](https://github.com/bvaughn/react-resizable-panels/pull/148): Build release bundle with Preconstruct

## 0.0.47

- Mimic VS COde behavior; collapse a panel if it's smaller than half of its min-size

## 0.0.46

- SSR: Avoid accessing default storage (`localStorage`) during initialization; avoid throwing error in browsers that have 3rd party cookies/storage disabled.

## 0.0.45

- SSR: Avoid layout shift by using `defaultSize` to set initial `flex-grow` style
- SSR: Warn if `Panel` is server-rendered without a `defaultSize` prop
- [#135](https://github.com/bvaughn/react-resizable-panels/issues/135): Support RTL layouts

## 0.0.44

- [#142](https://github.com/bvaughn/react-resizable-panels/pull/142): Avoid re-registering Panel when props change; this should reduce the number of scenarios requiring the `order` prop

## 0.0.43

- Add imperative `getLayout` API to `PanelGroup`
- [#139](https://github.com/bvaughn/react-resizable-panels/pull/139): Fix edge case bug where simultaneous `localStorage` updates to multiple saved groups would drop some values

## 0.0.42

- Change cursor style from `col-resize`/`row-resize` to `ew-resize`/`ns-resize` to better match cursor style at edges of a panel.

## 0.0.41

- Add imperative `setLayout` API for `PanelGroup`.

## 0.0.40

- README changes

## 0.0.39

- [#118](https://github.com/bvaughn/react-resizable-panels/issues/118): Fix import regression from 0.0.38.

## 0.0.38

- [#117](https://github.com/bvaughn/react-resizable-panels/issues/117): `Panel` collapse behavior works better near viewport edges.
- [#115](https://github.com/bvaughn/react-resizable-panels/pull/115): `PanelResizeHandle` logic calls `event.preventDefault` for events it handles.
- [#82](https://github.com/bvaughn/react-resizable-panels/issues/82): `useId` import changed to avoid triggering errors with older versions of React. (Note this may have an impact on tree-shaking though it is presumed to be minimal, given the small `"react"` package size.)

## 0.0.37

- [#94](https://github.com/bvaughn/react-resizable-panels/issues/94): Add `onDragging` prop to `PanelResizeHandle` to be notified of when dragging starts/stops.

## 0.0.36

- [#96](https://github.com/bvaughn/react-resizable-panels/issues/96): No longer disable `pointer-events` during resize by default. This behavior can be re-enabled using the newly added `PanelGroup` prop `disablePointerEventsDuringResize`.

## 0.0.35

- [#92](https://github.com/bvaughn/react-resizable-panels/pull/92): Change `browserslist` so compiled module works with CRA 4.0.3 Babel config out of the box.

## 0.0.34

- [#85](https://github.com/bvaughn/react-resizable-panels/issues/85): Add optional `storage` prop to `PanelGroup` to make it easier to persist layouts somewhere other than `localStorage` (e.g. like a Cookie).
- [#70](https://github.com/bvaughn/react-resizable-panels/issues/70): When resizing is done via mouse/touch event– some initial state is stored so that any panels that contract will also expand if drag direction is reversed.
- [#86](https://github.com/bvaughn/react-resizable-panels/issues/86): Layout changes triggered by keyboard no longer affect the global cursor.
- Fixed small cursor regression introduced in 0.0.33.

## 0.0.33

- Collapsible `Panel`s will always call `onCollapse` on-mount regardless of their collapsed state.
- Fixed regression in b5d3ec1 where arrow keys may fail to expand a collapsed panel.

## 0.0.32

- [#75](https://github.com/bvaughn/react-resizable-panels/issues/75): Ensure `Panel` and `PanelGroup` callbacks are always called after mounting.

## 0.0.31

- [#71](https://github.com/bvaughn/react-resizable-panels/issues/71): Added `getSize` and `getCollapsed` to imperative API exposed by `Panel`.
- [#67](https://github.com/bvaughn/react-resizable-panels/issues/67), [#72](https://github.com/bvaughn/react-resizable-panels/issues/72): Removed nullish coalescing operator (`??`) because it caused problems with default create-react-app configuration.
- Fix edge case when expanding a panel via imperative API that was collapsed by user drag

## 0.0.30

- [#68](https://github.com/bvaughn/react-resizable-panels/pull/68): Reduce volume/frequency of local storage writes for `PanelGroup`s configured to _auto-save_.
- Added `onLayout` prop to `PanelGroup` to be called when group layout changes. Note that some form of debouncing is recommended before processing these values (e.g. saving to a database).

## 0.0.29

- [#58](https://github.com/bvaughn/react-resizable-panels/pull/58): Add imperative `collapse`, `expand`, and `resize` methods to `Panel`.
- [#64](https://github.com/bvaughn/react-resizable-panels/pull/64): Disable `pointer-events` inside of `Panel`s during resize. This avoid edge cases like nested iframes.
- [#57](https://github.com/bvaughn/react-resizable-panels/pull/57): Improve server rendering check to include `window.document`. This more closely matches React's own check and avoids false positives for environments that alias `window` to some global object.

## 0.0.28

- [#53](https://github.com/bvaughn/react-resizable-panels/issues/53): Avoid `useLayoutEffect` warning when server rendering. Render panels with default style of `flex: 1 1 auto` during initial render.

## 0.0.27

- [#4](https://github.com/bvaughn/react-resizable-panels/issues/4): Add `collapsible` and `onCollapse` props to `Panel` to support auto-collapsing panels that resize beyond their `minSize` value (similar to VS Code's panel UX).

## 0.0.26

- Reduce style re-calc from resize-in-progress cursor style.

## 0.0.25

- While a resize is active, the global cursor style now reliably overrides per-element styles (to avoid flickering if you drag over e.g. an anchor element).

## 0.0.24

- [#49](https://github.com/bvaughn/react-resizable-panels/issues/49): Change cursor based on min/max boundaries.

## 0.0.23

- [#40](https://github.com/bvaughn/react-resizable-panels/issues/40): Add optional `maxSize` prop to `Panel`.
- [#41](https://github.com/bvaughn/react-resizable-panels/issues/41): Add optional `onResize` prop to `Panel`. This prop can be used (along with `defaultSize`) to persistence layouts somewhere externally.
- [#42](https://github.com/bvaughn/react-resizable-panels/issues/42): Don't cancel resize operations when exiting the window. Only cancel when a `"mouseup"` (or `"touchend"`) event is fired.

## 0.0.22

- Replaced the `"ew-resize"` and `"ns-resize"` cursor style with `"col-resize"` and `"row-resize"`.

## 0.0.21

- [#39](https://github.com/bvaughn/react-resizable-panels/issues/39): Fixed regression in TypeScript defs introduced in `0.0.20`

## 0.0.20

- Add `displayName` to `Panel`, `PanelGroup`, `PanelGroupContext`, and `PanelResizeHandle` to work around ParcelJS scope hoisting renaming.

## 0.0.19

- Add optional `style` and `tagName` props to `Panel`, `PanelGroup`, and `PanelResizeHandle` to simplify custom styling.
- Add `data-panel-group-direction` attribute to `PanelGroup` and `PanelResizeHandle` to simplify custom drag handle styling.

## 0.0.18

- `Panel` and `PanelGroup` now use `overflow: hidden` style by default to avoid potential scrollbar flickers while resizing.

## 0.0.17

- Bug fix: `Panel` styles include `flex-basis`, `flex-shrink`, and `overflow` so that their sizes are not unintentionally impacted by their content.

## 0.0.16

- Bug fix: Resize handle ARIA attributes now rendering proper min/max/now values for Window Splitter.
- Bug fix: Up/down arrows are ignored for _horizontal_ layouts and left/right arrows are ignored for _vertical_ layouts as per Window Splitter spec.
- [#36](https://github.com/bvaughn/react-resizable-panels/issues/36): Removed `PanelContext` in favor of adding `data-resize-handle-active` attribute to active resize handles. This attribute can be used to update the style for active handles.

## 0.0.15

- [#30](https://github.com/bvaughn/react-resizable-panels/issues/30): `PanelGroup` uses `display: flex` rather than absolute positioning. This provides several benefits: (a) more responsive resizing for nested groups, (b) no explicit `width`/`height` props, and (c) `PanelResizeHandle` components can now be rendered directly within `PanelGroup` (rather than as children of `Panel`s).

## 0.0.14

- [#23](https://github.com/bvaughn/react-resizable-panels/issues/23): Fix small regression with `autoSaveId` that was introduced with non-deterministic `useId` ids.

## 0.0.13

- [#18](https://github.com/bvaughn/react-resizable-panels/issues/18): Support server-side rendering (e.g. Next JS) by using `useId` (when available). `Panel` components no longer _require_ a user-provided `id` prop and will also fall back to using `useId` when none is provided.
- `PanelGroup` component now sets `position: relative` style by default, as well as an explicit `height` and `width` style.

## 0.0.12

- Bug fix: [#19](https://github.com/bvaughn/react-resizable-panels/issues/19): Fix initial "jump" that could occur when dragging started.
- Bug fix: [#20](https://github.com/bvaughn/react-resizable-panels/issues/20): Stop resize/drag operation on "contextmenu" event.
- Bug fix: [#21](https://github.com/bvaughn/react-resizable-panels/issues/21): Disable text selection while dragging active (Firefox only)

## 0.0.11

- Drag UX change: Reversing drag after dragging past the min/max size of a panel will no longer have an effect until the pointer overlaps with the resize handle. (Thanks @davidkpiano for the suggestion!)
- Bug fix: Resize handles are no longer left in a "focused" state after a touch/mouse event.

## 0.0.10

- Corrupt build artifact. Don't use this version.

## 0.0.9

- [#13](https://github.com/bvaughn/react-resizable-panels/issues/13): `PanelResizeHandle` should declare "separator" role and implement the recommended ["Window Splitter" pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)

## 0.0.8

- [#7](https://github.com/bvaughn/react-resizable-panels/issues/7): Support "touch" events for mobile compatibility.

## 0.0.7

- Add `PanelContext` with `activeHandleId` property identifying the resize handle currently being dragged (or `null`). This enables more customized UI/UX when resizing is in progress.

## 0.0.6

- [#5](https://github.com/bvaughn/react-resizable-panels/issues/5): Removed `panelBefore` and `panelAfter` props from `PanelResizeHandle`. `PanelGroup` now infers this based on position within the group.

## 0.0.5

- TypeScript props type fix for `PanelGroup`'s `children` prop.

## 0.0.4

- [#8](https://github.com/bvaughn/react-resizable-panels/issues/8): Added optional `order` prop to `Panel` to improve conditional rendering.

## 0.0.3

- [#3](https://github.com/bvaughn/react-resizable-panels/issues/3): `Panel`s can be conditionally rendered within a group. `PanelGroup` will persist separate layouts for each combination of visible panels.

## 0.0.2

- Documentation-only update.

## 0.0.1

- Initial release.
