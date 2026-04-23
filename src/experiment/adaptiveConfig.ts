export type ExperienceTask = "A" | "B";

export type ExperienceCondition = "adaptive" | "nonAdaptive";

export type AdaptiveThemeId = "cyber" | "nature" | "pastel" | "glitter";

export type AdaptiveTheme = {
  id: AdaptiveThemeId;
  label: string;
  preview: string;
  gradient: string;
  accent: string;
  soft: string;
};

export type AsrsProfile = {
  asrsPartAScore: number;
  asrsClassification: "baselineLowTraits" | "highTraitsThreshold";
  ticksPerReading: 2 | 4;
};

const ASRS_THRESHOLD_MAP: Record<string, number> = {
  Never: 0,
  Rarely: 0,
  Sometimes: 1,
  Often: 1,
  "Very Often": 1,
};

const LATE_THRESHOLD_MAP: Record<string, number> = {
  Never: 0,
  Rarely: 0,
  Sometimes: 0,
  Often: 1,
  "Very Often": 1,
};

export const adaptiveThemes: AdaptiveTheme[] = [
  {
    id: "cyber",
    label: "Cyber",
    preview: "radial-gradient(circle at 20% 20%, #89f7fe 0%, rgba(137,247,254,0.2) 18%), radial-gradient(circle at 80% 30%, #66a6ff 0%, rgba(102,166,255,0.18) 20%), linear-gradient(135deg, #3a0ca3 0%, #7209b7 55%, #4cc9f0 100%)",
    gradient: "linear-gradient(90deg, #5a189a 0%, #7b2cbf 35%, #3a86ff 68%, #4cc9f0 100%)",
    accent: "#7b2cbf",
    soft: "#efe5ff",
  },
  {
    id: "nature",
    label: "Nature",
    preview: "radial-gradient(circle at 25% 25%, rgba(255,244,170,0.6) 0%, rgba(255,244,170,0) 20%), radial-gradient(circle at 75% 75%, rgba(128,200,120,0.5) 0%, rgba(128,200,120,0) 25%), linear-gradient(135deg, #2d6a4f 0%, #52b788 55%, #d8f3dc 100%)",
    gradient: "linear-gradient(90deg, #2d6a4f 0%, #40916c 38%, #52b788 72%, #95d5b2 100%)",
    accent: "#2d6a4f",
    soft: "#e7f6ee",
  },
  {
    id: "pastel",
    label: "Pastel",
    preview: "linear-gradient(135deg, #ffcad4 0%, #f4acb7 20%, #cdb4db 55%, #bde0fe 100%)",
    gradient: "linear-gradient(90deg, #f4acb7 0%, #d8b4f8 44%, #bde0fe 100%)",
    accent: "#b185db",
    soft: "#faf1ff",
  },
  {
    id: "glitter",
    label: "Glitter",
    preview: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 7%), radial-gradient(circle at 68% 58%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0) 6%), linear-gradient(135deg, #8c5e1f 0%, #c9972c 30%, #ffe082 58%, #fff8e1 100%)",
    gradient: "linear-gradient(90deg, #b7791f 0%, #d4a017 32%, #f6d365 68%, #fff3b0 100%)",
    accent: "#c9972c",
    soft: "#fff8df",
  },
];

export function getExperienceCondition(
  groupNumber: number,
  task: ExperienceTask
): ExperienceCondition {
  if ((task === "A" && (groupNumber === 2 || groupNumber === 4)) ||
      (task === "B" && (groupNumber === 1 || groupNumber === 3))) {
    return "adaptive";
  }

  return "nonAdaptive";
}

export function getAdaptiveTheme(themeId?: AdaptiveThemeId | null): AdaptiveTheme {
  return adaptiveThemes.find((theme) => theme.id === themeId) ?? adaptiveThemes[0];
}

export function computeAsrsProfile(answers: string[]): AsrsProfile {
  const normalizedAnswers = answers.map((answer) => answer.trim());
  const earlyScore = normalizedAnswers
    .slice(0, 3)
    .reduce((sum, answer) => sum + (ASRS_THRESHOLD_MAP[answer] ?? 0), 0);
  const lateScore = normalizedAnswers
    .slice(3, 6)
    .reduce((sum, answer) => sum + (LATE_THRESHOLD_MAP[answer] ?? 0), 0);
  const asrsPartAScore = earlyScore + lateScore;
  const isHighTraitsThreshold = asrsPartAScore >= 4;

  return {
    asrsPartAScore,
    asrsClassification: isHighTraitsThreshold ? "highTraitsThreshold" : "baselineLowTraits",
    ticksPerReading: isHighTraitsThreshold ? 4 : 2,
  };
}
