import { getMountedAxes } from "../mutable-state/axes";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";
import { getImperativeItemMethods } from "../utils/getImperativeItemMethods";

export function onDocumentDoubleClick(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const mountedAxes = getMountedAxes();
  const hitRegions = findMatchingHitRegions(event, mountedAxes);
  hitRegions.forEach((current) => {
    if (current.separator && !current.separator.disableDoubleClick) {
      const itemWithDefaultSize = current.items.find(
        (item) => item.constraintProps.defaultSize !== undefined
      );
      if (itemWithDefaultSize) {
        const defaultSize = itemWithDefaultSize.constraintProps.defaultSize;
        const api = getImperativeItemMethods({
          axisId: current.axis.id,
          itemId: itemWithDefaultSize.id
        });
        if (api && defaultSize !== undefined) {
          api.resize(defaultSize);

          event.preventDefault();
        }
      }
    }
  });
}
