import type { PropsWithChildren } from "react";
import { Group, Panel, usePanelRef } from "react-resizable-panels";

// <begin>

function Section({ children, title }: PropsWithChildren<{ title: string }>) {
  const ref = usePanelRef();

  const toggle = () => {
    if (ref.current?.isCollapsed()) {
      ref.current.expand();
    } else {
      ref.current?.collapse();
    }
  };

  return (
    // Collapsed sections shrink down to the height of their header
    <Panel collapsedSize={28} collapsible minSize={70} panelRef={ref}>
      <button onClick={toggle} style={{ height: 28 }}>
        {title}
      </button>
      {children}
    </Panel>
  );
}

function Accordion() {
  return (
    <Group orientation="vertical">
      <Section title="Open editors">...</Section>
      <Section title="Folders">...</Section>
      <Section title="Outline">...</Section>
    </Group>
  );
}

// <end>

export { Accordion };
