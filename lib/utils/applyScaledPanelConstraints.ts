import type { SizeUnit } from "../components/panel/types";
import type { PanelHTMLElementInterface } from "../state/types";

export function applyScaledPanelConstraints({
  groupSize,
  panelDOMElementInterface,
  size,
  unit
}: {
  groupSize: number;
  panelDOMElementInterface: PanelHTMLElementInterface;
  size: number;
  unit: SizeUnit;
}) {
  let pixels: number;

  switch (unit) {
    case "em": {
      pixels = size * panelDOMElementInterface.getElementFontSize();
      break;
    }
    case "rem": {
      pixels = size * panelDOMElementInterface.getRootFontSize();
      break;
    }
    case "vh": {
      pixels = (size / 100) * panelDOMElementInterface.getWindowSize().height;
      break;
    }
    case "vw": {
      pixels = (size / 100) * panelDOMElementInterface.getWindowSize().width;
      break;
    }
    case "%": {
      pixels = size;
      break;
    }
    case "px": {
      pixels = (size / groupSize) * 100;
      break;
    }
  }

  return parseFloat(pixels.toFixed(3));
}
