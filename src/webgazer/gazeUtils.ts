export type GazeState = "attention" | "distraction";

const TEXT_AREA = {
  left: 200,
  right: 1000,
  top: 100,
  bottom: 800
};

export const classifyGaze = (x: number, y: number): GazeState => {
  const margin = 80;

  if (
    x > TEXT_AREA.left - margin &&
    x < TEXT_AREA.right + margin &&
    y > TEXT_AREA.top - margin &&
    y < TEXT_AREA.bottom + margin
  ) {
    return "attention";
  }

  return "distraction";
};
