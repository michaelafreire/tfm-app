import type { AdaptiveThemeId } from "./adaptiveConfig";

export type ExperimentRouteState = {
  participantCode?: string;
  groupNumber?: number;
  nextPath?: string;
  asrsPartAScore?: number;
  asrsClassification?: "baselineLowTraits" | "highTraitsThreshold";
  ticksPerReading?: 2 | 4;
  selectedTheme?: AdaptiveThemeId;
};
