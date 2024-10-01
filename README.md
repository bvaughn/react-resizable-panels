<img width="328" alt="React Resizable Panels logo" src="https://user-images.githubusercontent.com/29597/210075327-faeb4ca8-31df-4dc8-a649-01d0ee3cd315.png" />

## react-resizable-panels

React components for resizable panel groups/layouts.

- [View the website](https://react-resizable-panels.vercel.app/)
- [Try it on CodeSandbox](https://codesandbox.io/s/react-resizable-panels-zf7hwd)
- [Read the documentation](https://github.com/bvaughn/react-resizable-panels/tree/main/packages/react-resizable-panels)
- [View the changelog](https://github.com/bvaughn/react-resizable-panels/blob/main/packages/react-resizable-panels/CHANGELOG.md)

Supported input methods include mouse, touch, and keyboard (via [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)).

---

### If you like this project, 🎉 [become a sponsor](https://github.com/sponsors/bvaughn/) or ☕ [buy me a coffee](http://givebrian.coffee/)

---

## FAQ

### Can panel sizes be specified in pixels?

No. Pixel-based constraints [added significant complexity](https://github.com/bvaughn/react-resizable-panels/pull/176) to the initialization and validation logic and so I've decided not to support them. You may be able to implement a version of this yourself following [a pattern like this](https://github.com/bvaughn/react-resizable-panels/issues/46#issuecomment-1368108416) but it is not officially supported by this library.

### How can I fix layout/sizing problems with conditionally rendered panels?

The `Panel` API doesn't _require_ `id` and `order` props because they aren't necessary for static layouts. When panels are conditionally rendered though, it's best to supply these values.

```tsx
<PanelGroup direction="horizontal">
  {renderSideBar && (
    <>
      <Panel id="sidebar" minSize={25} order={1}>
        <Sidebar />
      </Panel>
      <PanelResizeHandle />
    </>
  )}
  <Panel minSize={25} order={2}>
    <Main />
  </Panel>
</PanelGroup>
```

### Can I attach a ref to the DOM elements?

No. I think exposing two refs (one for the component's imperative API and one for a DOM element) would be awkward. This library does export several utility methods for accessing the underlying DOM elements though. For example:

```tsx
import {
  getPanelElement,
  getPanelGroupElement,
  getResizeHandleElement,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

export function Example() {
  const refs = useRef();

  useEffect(() => {
    const groupElement = getPanelGroupElement("group");
    const leftPanelElement = getPanelElement("left-panel");
    const rightPanelElement = getPanelElement("right-panel");
    const resizeHandleElement = getResizeHandleElement("resize-handle");

    // If you want to, you can store them in a ref to pass around
    refs.current = {
      groupElement,
      leftPanelElement,
      rightPanelElement,
      resizeHandleElement,
    };
  }, []);

  return (
    <PanelGroup direction="horizontal" id="group">
      <Panel id="left-panel">{/* ... */}</Panel>
      <PanelResizeHandle id="resize-handle" />
      <Panel id="right-panel">{/* ... */}</Panel>
    </PanelGroup>
  );
}
```

### Why don't I see any resize UI?

This likely means that you haven't applied any CSS to style the resize handles. By default, a resize handle is just an empty DOM element. To add styling, use the `className` or `style` props:

```tsx
// Tailwind example
<PanelResizeHandle className="w-2 bg-blue-800" />
```

### How can I use persistent layouts with SSR?

By default, this library uses `localStorage` to persist layouts. With server rendering, this can cause a flicker when the default layout (rendered on the server) is replaced with the persisted layout (in `localStorage`). The way to avoid this flicker is to also persist the layout with a cookie like so:

#### Server component

```tsx
import ResizablePanels from "@/app/ResizablePanels";
import { cookies } from "next/headers";

export function ServerComponent() {
  const layout = cookies().get("react-resizable-panels:layout");

  let defaultLayout;
  if (layout) {
    defaultLayout = JSON.parse(layout.value);
  }

  return <ClientComponent defaultLayout={defaultLayout} />;
}
```

#### Client component

```tsx
"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export function ClientComponent({
  defaultLayout = [33, 67],
}: {
  defaultLayout: number[] | undefined;
}) {
  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };

  return (
    <PanelGroup direction="horizontal" onLayout={onLayout}>
      <Panel defaultSize={defaultLayout[0]}>{/* ... */}</Panel>
      <PanelResizeHandle className="w-2 bg-blue-800" />
      <Panel defaultSize={defaultLayout[1]}>{/* ... */}</Panel>
    </PanelGroup>
  );
}
```

> [!NOTE]
> Be sure to specify a `defaultSize` prop for **every** `Panel` component to avoid layout flicker.

A demo of this is available [here](https://github.com/bvaughn/react-resizable-panels-demo-ssr).

#### How can I set the [CSP `"nonce"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) attribute?

```js
import { setNonce } from "react-resizable-panels";

setNonce("your-nonce-value-here");
```

#### How can I disable global cursor styles?

```js
import { disableGlobalCursorStyles } from "react-resizable-panels";

disableGlobalCursorStyles();
```
