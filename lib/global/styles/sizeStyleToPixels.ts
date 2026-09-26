import { convertEmToPixels } from "./convertEmToPixels";
import { convertRemToPixels } from "./convertRemToPixels";
import { convertVhToPixels } from "./convertVhToPixels";
import { convertVwToPixels } from "./convertVwToPixels";
import { parseSizeAndUnit } from "./parseSizeAndUnit";

export function sizeStyleToPixels({
  axisSize,
  itemElement,
  styleProp
}: {
  axisSize: number;
  itemElement: HTMLElement;
  styleProp: number | string;
}) {
  let pixels: number | undefined = undefined;

  const [size, unit] = parseSizeAndUnit(styleProp);

  switch (unit) {
    case "%": {
      pixels = (size / 100) * axisSize;
      break;
    }
    case "px": {
      pixels = size;
      break;
    }
    case "rem": {
      pixels = convertRemToPixels(itemElement, size);
      break;
    }
    case "em": {
      pixels = convertEmToPixels(itemElement, size);
      break;
    }
    case "vh": {
      pixels = convertVhToPixels(size);
      break;
    }
    case "vw": {
      pixels = convertVwToPixels(size);
      break;
    }
  }

  return pixels;
}
