import type { AdaptiveThemeId } from "./adaptiveConfig";
import type { ExperimentLanguage } from "../i18n";

export type ExperimentRouteState = {
  participantCode?: string;
  groupNumber?: number;
  language?: ExperimentLanguage;
  nextPath?: string;
  introExperience?: "A" | "B";
  calibrationExperience?: "A" | "B";
  calibrationAccuracyPercent?: number;
  calibrationAverageErrorPx?: number;
  asrsPartAScore?: number;
  asrsClassification?: "baselineLowTraits" | "highTraitsThreshold";
  ticksPerReading?: 2 | 4;
  selectedTheme?: AdaptiveThemeId;
};
