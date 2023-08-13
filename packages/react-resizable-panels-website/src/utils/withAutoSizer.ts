import { FunctionComponent, createElement } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import type {
  Props as AutoSizerProps,
  Size,
} from "react-virtualized-auto-sizer";

export default function withAutoSizer<ComponentProps>(
  Component: FunctionComponent<
    ComponentProps & {
      height: number;
      width: number;
    }
  >,
  autoSizerProps?: Partial<AutoSizerProps>
): FunctionComponent<Omit<ComponentProps, "height" | "width">> {
  const AutoSizerWrapper = (
    props: Omit<ComponentProps, "height" | "width">
  ) => {
    return createElement(AutoSizer, {
      ...autoSizerProps,
      children: ({ height, width }: Size) =>
        createElement(Component as any, { ...props, height, width }),
    });
  };

  return AutoSizerWrapper;
}
