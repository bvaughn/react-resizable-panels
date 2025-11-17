import { NavLink } from "./NavLink";
import { NavSection } from "./NavSection";

export function Nav() {
  return (
    <div className="w-full shrink-0 flex flex-col gap-4 py-4 overflow-y-auto">
      <NavLink path="/">Getting started</NavLink>
      <NavSection label="Examples">
        <NavLink path="/examples/the-basics">The basics</NavLink>
        <NavLink path="/examples/min-max-sizes">Min/max sizes</NavLink>
        <NavLink path="/examples/collapsible-panels">
          Collapsible panels
        </NavLink>
        <NavLink path="/examples/persistent-layout">Persistent layouts</NavLink>
        <NavLink path="/examples/server-side-rendering">
          Server-side rendering
        </NavLink>
        <NavLink path="/examples/nested-groups">Nested groups</NavLink>
      </NavSection>
      <NavSection label="Props">
        <NavLink path="/props/group">Group component</NavLink>
        <NavLink path="/props/panel">Panel component</NavLink>
        <NavLink path="/props/resize-handle">ResizeHandle component</NavLink>
      </NavSection>
      <NavSection label="Imperative API">
        <NavLink path="/imperative-api/update-group-layout">
          Update Group layout
        </NavLink>
        <NavLink path="/imperative-api/update-panel-size">
          Update Panel size
        </NavLink>
      </NavSection>
      <div>
        <NavLink path="/platform-requirements">Requirements</NavLink>
        <NavLink path="/support">Support</NavLink>
      </div>
    </div>
  );
}
