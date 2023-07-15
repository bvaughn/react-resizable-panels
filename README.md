<img width="328" alt="React Resizable Panels logo" src="https://user-images.githubusercontent.com/29597/210075327-faeb4ca8-31df-4dc8-a649-01d0ee3cd315.png" />

## react-resizable-panels
React components for resizable panel groups/layouts.

* [View the website](https://react-resizable-panels.vercel.app/)
* [Try it on CodeSandbox](https://codesandbox.io/s/react-resizable-panels-zf7hwd)
* [Read the documentation](https://github.com/bvaughn/react-resizable-panels/tree/main/packages/react-resizable-panels)
* [View the changelog](https://github.com/bvaughn/react-resizable-panels/blob/main/packages/react-resizable-panels/CHANGELOG.md)

Supported input methods include mouse, touch, and keyboard (via [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)).

---

### If you like this project, 🎉 [become a sponsor](https://github.com/sponsors/bvaughn/) or ☕ [buy me a coffee](http://givebrian.coffee/)

---

## FAQ

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

### How can I use persistent layouts with SSR?

By default, this library uses `localStorage` to persist layouts. With server rendering, this can cause a flicker when the default layout (rendered on the server) is replaced with the persisted layout (in `localStorage`). The way to avoid this flicker is to also persist the layout with a cookie like so:

##### Server component
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

##### Client component
```tsx
"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export function ClientComponent({
  defaultLayout = [33, 67]
}: {
  defaultLayout: number[] | undefined
}) {
  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };

  return (
    <PanelGroup direction="horizontal" onLayout={onLayout}>
      <Panel defaultSize={defaultLayout[0]}>
        {/* ... */}
      </Panel>
      <PanelResizeHandle className="w-2 bg-blue-800" />
      <Panel defaultSize={defaultLayout[1]}>
        {/* ... */}
      </Panel>
    </PanelGroup>
  );
}
```

A demo of this is available [here](https://github.com/bvaughn/react-resizable-panels-demo-ssr).