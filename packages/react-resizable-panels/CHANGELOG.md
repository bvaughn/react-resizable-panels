# Changelog

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
