import { RefObject, useEffect } from "react";
import { assert } from "react-resizable-panels";
import { Sequence, Target } from "./LogoAnimation";

export function useLogoAnimation(
  svgRef: RefObject<SVGSVGElement>,
  sequence: Sequence
) {
  useEffect(() => {
    const svg = svgRef.current!;

    const targetToPathElements: { [key in Target]: SVGPathElement } = {
      bottomLeft: svg.children[1] as SVGPathElement,
      bottomRight: svg.children[2] as SVGPathElement,
      topLeft: svg.children[0] as SVGPathElement,
      topRight: svg.children[3] as SVGPathElement,
    };

    const startTime = performance.now();
    const duration = sequence.reduce(
      (total, animation) => total + animation.duration,
      0
    );

    let animationFrameId: number | null = null;

    function animate() {
      const currentTime = performance.now();
      const elapsed = (currentTime - startTime) % duration;

      let segment;
      let accumulatedDuration = 0;
      for (let index = 0; index < sequence.length; index++) {
        segment = sequence[index];
        assert(segment, `No segment found for index "${index}"`);

        if (
          elapsed >= accumulatedDuration &&
          elapsed <= accumulatedDuration + segment.duration
        ) {
          break;
        } else {
          accumulatedDuration += segment.duration;
        }
      }

      if (segment?.type === "animation") {
        const value = easing(
          (elapsed - accumulatedDuration) / segment.duration
        );

        segment.properties.forEach(({ from, property, target, to }) => {
          const pathElement = targetToPathElements[target];
          pathElement.setAttribute(property, `${from + value * (to - from)}`);
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
}

// https://easings.net/#easeInOutBack
function easing(value: number): number {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return value < 0.5
    ? (Math.pow(2 * value, 2) * ((c2 + 1) * 2 * value - c2)) / 2
    : (Math.pow(2 * value - 2, 2) * ((c2 + 1) * (value * 2 - 2) + c2) + 2) / 2;
}
