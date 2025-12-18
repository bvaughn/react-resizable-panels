import { ArrowTurnDownRightIcon } from "@heroicons/react/20/solid";
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
        <NavLink path="/examples/persistent-layout/server-rendering">
          <ArrowTurnDownRightIcon className="size-4 fill-white/60" /> Server
          rendering
        </NavLink>
        <NavLink path="/examples/persistent-layout/server-components">
          <ArrowTurnDownRightIcon className="size-4 fill-white/60" /> Server
          components
        </NavLink>
        <NavLink path="/examples/nested-groups">Nested groups</NavLink>
        <NavLink path="/examples/conditional-panels">
          Conditional panels
        </NavLink>
        <NavLink path="/examples/conditional-panels-with-persistence">
          <ArrowTurnDownRightIcon className="size-4 fill-white/60" /> With
          persistence
        </NavLink>
        <NavLink path="/examples/fixed-size-panels">Fixed size panels</NavLink>
        <NavLink path="/examples/custom-css-styles">Custom CSS styles</NavLink>
      </NavSection>
      <NavSection label="Props">
        <NavLink path="/props/group">Group component</NavLink>
        <NavLink path="/props/panel">Panel component</NavLink>
        <NavLink path="/props/separator">Separator component</NavLink>
      </NavSection>
      <NavSection label="Imperative APIs">
        <NavLink path="/imperative-api/group">Group API</NavLink>
        <NavLink path="/imperative-api/panel">Panel API</NavLink>
      </NavSection>
      <div>
        <NavLink path="/platform-requirements">Requirements</NavLink>
        <NavLink path="/support">Support</NavLink>
      </div>
    </div>
  );
}
