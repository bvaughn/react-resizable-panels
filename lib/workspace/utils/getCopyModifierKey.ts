/**
 * The key that makes drags copy (rather than move) while it's held, like file managers do:
 * Option (`"Alt"`) on Apple platforms (like Finder), Ctrl (`"Control"`) elsewhere (like Windows Explorer).
 */
export function getCopyModifierKey(
  ownerWindow: Window | null | undefined
): "Alt" | "Control" {
  const navigator = ownerWindow?.navigator as
    | (Navigator & { userAgentData?: { platform?: string } })
    | undefined;
  const platform =
    navigator?.userAgentData?.platform ?? navigator?.platform ?? "";

  return /mac|iphone|ipad|ipod/i.test(platform) ? "Alt" : "Control";
}
