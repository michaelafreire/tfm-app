type ReadingStep = {
  id: string;
  label: string;
  description: string;
  question: Array<unknown>;
};

export type ScrollReadingStats = {
  startedAt: number;
  lastTop: number;
  direction: -1 | 0 | 1;
  directionChanges: number;
  scrollEvents: number;
  maxProgress: number;
  checkpointZoneEnteredAtByIndex: Record<number, number>;
  lastCheckpointCompletedAt: number;
};

export const MIN_CHECKPOINT_INTERVAL_MS = 12_000;
export const MIN_CHECKPOINT_ZONE_MS = 5_000;

export function clampCheckpointCount(count: number) {
  return Math.max(1, Math.min(5, Math.round(count)));
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadingDifficulty(step: ReadingStep) {
  const wordCount = countWords(step.description);
  const questionLoad = step.question.length * 0.18;
  const lengthLoad = wordCount / 240;
  return lengthLoad + questionLoad;
}

export function recommendCheckpointCount(readingSteps: ReadingStep[], asrsPartAScore?: number) {
  if (readingSteps.length === 0) return 3;

  const averageDifficulty =
    readingSteps.reduce((sum, step) => sum + estimateReadingDifficulty(step), 0) / readingSteps.length;
  const asrsLoad = Math.max(0, Math.min(2, (asrsPartAScore ?? 0) / 2.5));
  const recommended = 1 + averageDifficulty + asrsLoad;

  return clampCheckpointCount(recommended);
}

export function estimateExpectedReadingMs(step: ReadingStep) {
  const wordCount = countWords(step.description);
  const readingMs = (wordCount / 190) * 60_000;
  const questionPreviewMs = step.question.length * 4_000;
  return Math.max(35_000, readingMs + questionPreviewMs);
}

export function createScrollReadingStats(scrollTop = 0): ScrollReadingStats {
  return {
    startedAt: Date.now(),
    lastTop: scrollTop,
    direction: 0,
    directionChanges: 0,
    scrollEvents: 0,
    maxProgress: 0,
    checkpointZoneEnteredAtByIndex: {},
    lastCheckpointCompletedAt: Date.now(),
  };
}
