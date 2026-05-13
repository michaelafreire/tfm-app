import { supabase } from "../supabaseClient";
import { clampCheckpointCount } from "../experiment/checkpointPlan";

export type CheckpointPlacement = {
  afterParagraph: number;
  label: string;
};

export type InitialCheckpointPlan = {
  source: "openai" | "fallback";
  recommendedCheckpoints: number;
  reason: string;
  options: number[];
  readings: Array<{
    stepId: string;
    checkpointCount: number;
    checkpoints: CheckpointPlacement[];
  }>;
};

export type AdaptiveSuggestion = {
  source: "openai" | "fallback";
  recommendation: "add_checkpoint" | "reduce_checkpoints" | "keep_same";
  target: "current_reading" | "next_reading";
  message: string;
};

type ReadingPlanInput = {
  stepId: string;
  label: string;
  text: string;
  questionCount: number;
};

type InitialPlanInput = {
  language?: string;
  asrsPartAScore?: number;
  asrsClassification?: string;
  readings: ReadingPlanInput[];
};

type DuringReadingInput = {
  language?: string;
  currentCheckpointCount: number;
  readingProgressPercent: number;
  scrollDirectionChanges: number;
  secondsWithoutProgress?: number;
  probeResponse?: string;
};

type AfterReadingInput = {
  language?: string;
  currentCheckpointCount: number;
  readingDurationMs: number | null;
  expectedDurationMs: number;
  scrollDirectionChanges: number;
  probeResponse?: string;
};

function sanitizeOptions(options: unknown, recommended: number) {
  const values = Array.isArray(options) ? options : [1, recommended, 5];
  const valid = Array.from(
    new Set(values.map((value) => clampCheckpointCount(Number(value))).filter((value) => Number.isFinite(value)))
  );

  if (!valid.includes(recommended)) valid.push(recommended);
  if (!valid.includes(1)) valid.push(1);
  if (!valid.includes(5)) valid.push(5);

  return valid
    .sort((a, b) => Math.abs(a - recommended) - Math.abs(b - recommended) || a - b)
    .slice(0, 3)
    .sort((a, b) => a - b);
}

function sanitizeInitialPlan(data: unknown, fallbackRecommended: number, readings: ReadingPlanInput[]): InitialCheckpointPlan | null {
  if (!data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  const recommendedCheckpoints = clampCheckpointCount(Number(raw.recommendedCheckpoints));
  if (!Number.isFinite(recommendedCheckpoints)) return null;

  const rawReadings = Array.isArray(raw.readings) ? raw.readings : [];
  const sanitizedReadings = readings.map((reading) => {
    const matching = rawReadings.find((item) => {
      return item && typeof item === "object" && (item as Record<string, unknown>).stepId === reading.stepId;
    }) as Record<string, unknown> | undefined;
    const checkpointCount = clampCheckpointCount(Number(matching?.checkpointCount ?? recommendedCheckpoints));
    const paragraphCount = reading.text.split("\n").map((line) => line.trim()).filter(Boolean).length;
    const checkpoints = Array.isArray(matching?.checkpoints)
      ? matching.checkpoints
          .map((checkpoint) => {
            if (!checkpoint || typeof checkpoint !== "object") return null;
            const item = checkpoint as Record<string, unknown>;
            const afterParagraph = Math.max(1, Math.min(paragraphCount, Math.round(Number(item.afterParagraph))));
            const label = String(item.label ?? "Key idea complete").slice(0, 48);
            if (!Number.isFinite(afterParagraph)) return null;
            return { afterParagraph, label };
          })
          .filter((checkpoint): checkpoint is CheckpointPlacement => checkpoint !== null)
          .slice(0, Math.max(0, checkpointCount - 1))
      : [];

    return {
      stepId: reading.stepId,
      checkpointCount,
      checkpoints,
    };
  });

  return {
    source: "openai",
    recommendedCheckpoints,
    reason: String(raw.reason ?? "Recommended from reading structure and ASRS profile.").slice(0, 220),
    options: sanitizeOptions(raw.options, recommendedCheckpoints || fallbackRecommended),
    readings: sanitizedReadings,
  };
}

function sanitizeSuggestion(data: unknown): AdaptiveSuggestion | null {
  if (!data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  const recommendation = raw.recommendation;
  const target = raw.target;
  if (recommendation !== "add_checkpoint" && recommendation !== "reduce_checkpoints" && recommendation !== "keep_same") return null;
  if (target !== "current_reading" && target !== "next_reading") return null;

  return {
    source: "openai",
    recommendation,
    target,
    message: String(raw.message ?? "Would you like to adjust the checkpoint plan?").slice(0, 220),
  };
}

export async function getInitialCheckpointPlan(
  input: InitialPlanInput,
  fallbackRecommended: number,
): Promise<InitialCheckpointPlan | null> {
  try {
    const { data, error } = await supabase.functions.invoke("adaptive-checkpoints", {
      body: {
        event: "initial_plan",
        ...input,
      },
    });
    if (error) throw error;
    return sanitizeInitialPlan(data, fallbackRecommended, input.readings);
  } catch (error) {
    console.warn("Falling back to local checkpoint recommendation", error);
    return null;
  }
}

export async function getDuringReadingSuggestion(input: DuringReadingInput): Promise<AdaptiveSuggestion | null> {
  try {
    const { data, error } = await supabase.functions.invoke("adaptive-checkpoints", {
      body: {
        event: "during_reading",
        ...input,
      },
    });
    if (error) throw error;
    return sanitizeSuggestion(data);
  } catch (error) {
    console.warn("Falling back to local during-reading suggestion", error);
    return null;
  }
}

export async function getAfterReadingSuggestion(input: AfterReadingInput): Promise<AdaptiveSuggestion | null> {
  try {
    const { data, error } = await supabase.functions.invoke("adaptive-checkpoints", {
      body: {
        event: "after_reading",
        ...input,
      },
    });
    if (error) throw error;
    return sanitizeSuggestion(data);
  } catch (error) {
    console.warn("Falling back to local after-reading suggestion", error);
    return null;
  }
}
