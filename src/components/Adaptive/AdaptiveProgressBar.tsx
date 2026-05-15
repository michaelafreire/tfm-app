import ProgressBar from "../ProgressBar/ProgressBar";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";

export type CompanionStyle = "calm" | "steady" | "bright" | "quiet";
export type MarkerStyle = CompanionStyle;

export const companionOptions: Array<{
  value: CompanionStyle;
  labelKey: string;
  color: string;
  shadow: string;
  shape: "round" | "square" | "bean" | "arch";
}> = [
  { value: "calm", labelKey: "adaptive.companions.calm", color: "#5bcac3", shadow: "#d6f5f1", shape: "round" },
  { value: "steady", labelKey: "adaptive.companions.steady", color: "#a77bd8", shadow: "#efe5ff", shape: "square" },
  { value: "bright", labelKey: "adaptive.companions.bright", color: "#ffbd4a", shadow: "#fff0cf", shape: "bean" },
  { value: "quiet", labelKey: "adaptive.companions.quiet", color: "#557ec1", shadow: "#e1ebff", shape: "arch" },
];

export function normalizeCompanionStyle(style?: string): CompanionStyle {
  if (style === "steady" || style === "bright" || style === "quiet" || style === "calm") return style;
  return "calm";
}

export function getCompanionOption(style?: string) {
  const normalized = normalizeCompanionStyle(style);
  return companionOptions.find((option) => option.value === normalized) ?? companionOptions[0];
}

export function getMarkerColor(style: MarkerStyle, theme: AdaptiveTheme) {
  return getCompanionOption(style).color || theme.accent;
}

type Step = {
  id: string;
  label: string;
};

type AdaptiveProgressBarProps = {
  steps: Step[];
  currentStep: number;
  theme: AdaptiveTheme;
  checkpointCountsByStep: Record<string, number>;
  completedCheckpointsByStep: Record<string, number>;
  markerStyle: MarkerStyle;
  markerDimByStep?: Record<string, number>;
  shiningCheckpoint?: {
    stepId: string;
    checkpointIndex: number;
  } | null;
};

function AdaptiveProgressBar({ steps, currentStep }: AdaptiveProgressBarProps) {
  return <ProgressBar steps={steps} currentStep={currentStep} />;
}

export default AdaptiveProgressBar;
