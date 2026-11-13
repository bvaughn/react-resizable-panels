/**
 * Where a popup window is on the screen; some browsers report the opener's position as the popup's (e.g. Brave),
 * so where the popup was opened is returned when it reports the opener's exact position (even if the user has moved it).
 */
export function getPopupPosition(
  popup: Window,
  opener: Window,
  openedAt: { screenX: number; screenY: number }
): { screenX: number; screenY: number } {
  return popup.screenX === opener.screenX && popup.screenY === opener.screenY
    ? openedAt
    : { screenX: popup.screenX, screenY: popup.screenY };
}
