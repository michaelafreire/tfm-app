import type { AdaptiveThemeId } from "./adaptiveConfig";
import type { ExperimentLanguage } from "../i18n";

export type ExperimentRouteState = {
  participantCode?: string;
  groupNumber?: number;
  language?: ExperimentLanguage;
  nextPath?: string;
  introExperience?: "A" | "B";
  asrsPartAScore?: number;
  asrsClassification?: "baselineLowTraits" | "highTraitsThreshold";
  ticksPerReading?: 2 | 4;
  selectedTheme?: AdaptiveThemeId;
};
