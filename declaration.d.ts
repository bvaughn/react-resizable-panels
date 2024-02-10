declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "stacking-order" {
  export function compare(a: Element, b: Element): number;
}
