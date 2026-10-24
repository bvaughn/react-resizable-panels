import type { PropsWithChildren } from "react";
import { Group, Panel, useParentPanel } from "react-resizable-panels";

// <begin>

function Accordion() {
  return (
    <Group orientation="vertical">
      <Section title="Open editors">...</Section>
      <Section title="Folders">...</Section>
      <Section title="Outline">...</Section>
    </Group>
  );
}

function Section({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <Panel collapsedSize={28} collapsible minSize={70}>
      <SectionHeader title={title} />
      {children}
    </Panel>
  );
}

function SectionHeader({ title }: { title: string }) {
  const panel = useParentPanel();

  const toggle = () => {
    if (panel?.isCollapsed()) {
      panel.expand();
    } else {
      panel?.collapse();
    }
  };

  return (
    <button onClick={toggle} style={{ height: 28 }}>
      {title}
    </button>
  );
}

// <end>

export { Accordion };
