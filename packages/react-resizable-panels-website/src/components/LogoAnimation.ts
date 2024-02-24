import { assert } from "react-resizable-panels";

export const Targets = {
  bottomLeft: "bottomLeft",
  bottomRight: "bottomRight",
  topLeft: "topLeft",
  topRight: "topRight",
};

export type Target = keyof typeof Targets;

const targets = Object.keys(Targets) as Array<keyof typeof Targets>;

const Properties = {
  height: "height",
  x: "x",
  y: "y",
  width: "width",
};

type Property = keyof typeof Properties;

const properties = Object.keys(Properties) as Array<keyof typeof Properties>;

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Pause = {
  type: "pause";
  duration: number;
};

type Stage = {
  type: "stage";
  duration: number;
  paths: {
    [key in Target]: Rectangle;
  };
};

const PAUSE_DURATION = 500;
const STAGE_DURATION = 1_000;

const pause: Pause = {
  type: "pause",
  duration: PAUSE_DURATION,
};

type Frames = Array<Stage | Pause>;

const frames: Frames = [
  pause,
  {
    type: "stage",
    duration: STAGE_DURATION,
    paths: {
      bottomLeft: { x: 10, y: 165, width: 72, height: 72 },
      bottomRight: { x: 92, y: 93, width: 146, height: 144 },
      topLeft: { x: 10, y: 10, width: 72, height: 145 },
      topRight: { x: 92, y: 10, width: 146, height: 73 },
    },
  },
  pause,
  {
    type: "stage",
    duration: STAGE_DURATION,
    paths: {
      bottomLeft: { x: 10, y: 165, width: 146, height: 72 },
      bottomRight: { x: 166, y: 93, width: 72, height: 144 },
      topLeft: { x: 10, y: 10, width: 146, height: 145 },
      topRight: { x: 166, y: 10, width: 72, height: 73 },
    },
  },
  pause,
  {
    type: "stage",
    duration: STAGE_DURATION,
    paths: {
      bottomLeft: { x: 10, y: 78, width: 146, height: 159 },
      bottomRight: { x: 166, y: 204, width: 72, height: 31 },
      topLeft: { x: 10, y: 10, width: 146, height: 58 },
      topRight: { x: 166, y: 10, width: 72, height: 184 },
    },
  },
];

type AnimatedProperty = {
  target: Target;
  property: Property;
  from: number;
  to: number;
};

type Animation = {
  type: "animation";
  duration: number;
  properties: AnimatedProperty[];
};

export type Sequence = Array<Animation | Pause>;

export const sequence: Sequence = [];

const stages = frames.filter((step): step is Stage => step.type === "stage");

for (let index = 0; index < frames.length; index++) {
  const frame = frames[index];
  assert(frame, `No frame found for index ${index}`);

  switch (frame.type) {
    case "pause":
      sequence.push(frame);
      break;
    case "stage":
      const fromStage = frame;

      const index = stages.indexOf(fromStage);
      const toStage = index + 1 < stages.length ? stages[index + 1] : stages[0];
      assert(toStage != null, "Stage not found");

      const changedProperties: AnimatedProperty[] = [];

      targets.forEach((target) => {
        properties.forEach((property) => {
          const from = fromStage.paths[target][property];
          const to = toStage.paths[target][property];

          if (from !== to) {
            changedProperties.push({
              target,
              property,
              from,
              to,
            });
          }
        });
      }, []);

      sequence.push({
        type: "animation",
        duration: frame.duration,
        properties: changedProperties,
      });
      break;
  }
}
