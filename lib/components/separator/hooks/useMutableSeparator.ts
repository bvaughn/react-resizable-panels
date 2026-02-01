import { useMemo, useSyncExternalStore, type RefObject } from "react";
import { useHTMLElementInterface } from "../../../hooks/useHTMLElementInterface";
import { useId } from "../../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import { MutableSeparator } from "../../../state/MutableSeparator";
import { useGroupContext } from "../../group/hooks/useGroupContext";

/**
 * Creates a MutableSeparator instance and registers it with the parent MutableGroup.
 *
 * @returns MutableSeparator instance
 */
export function useMutableSeparator({
  elementRef,
  id: idProp
}: {
  elementRef: RefObject<HTMLElement | null>;
  id: string | number | undefined;
}) {
  const id = useId(idProp);

  const group = useGroupContext();

  const elementInterface = useHTMLElementInterface(elementRef);

  const separator = useMemo(
    () => new MutableSeparator({ elementInterface, group, id }),
    [elementInterface, group, id]
  );

  useIsomorphicLayoutEffect(() => {
    separator.mount();
    return () => {
      separator.unmount();
    };
  }, [separator]);

  const dragState = useSyncExternalStore(
    (onChange) => separator.addListener("separatorState", onChange),
    () => separator.state,
    () => separator.state
  );

  const ariaAttributes = useSyncExternalStore(
    (onChange) => separator.addListener("ariaAttributes", onChange),
    () => separator.ariaAttributes,
    () => separator.ariaAttributes
  );

  useIsomorphicLayoutEffect(
    () => group.addSeparators(separator),
    [group, separator]
  );

  return { ariaAttributes, id, dragState, separator };
}
