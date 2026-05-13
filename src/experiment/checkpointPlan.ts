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
  maxTimeWithoutScrollMs: number;
};

export const CHECKPOINT_ACTIVATION_LEAD_PERCENT = 8;

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

export type BackupCheckpointSuggestion = {
  direction: "more" | "less" | "same";
  message: string;
};

type BackupLanguage = "en" | "es" | "ca";

const backupMessages: Record<BackupLanguage, Record<"probe" | "pause" | "erratic" | "steady" | "same", string>> = {
  en: {
    probe: "The last text may have been a little demanding, so smaller sections could make this one easier to pace. Would you like to add one checkpoint?",
    pause: "The last text may have needed extra concentration, so a little more structure could help with the next one. Would you like to add one checkpoint?",
    erratic: "The last text may have been complex to follow, and smaller sections could make the next one feel more manageable. Would you like to add one checkpoint?",
    steady: "That setup seemed to work well for you. Would you like fewer checkpoints for this reading so there are fewer interruptions?",
    same: "The checkpoint setup seems to be working well. Shall we keep it as it is for this reading?",
  },
  es: {
    probe: "El texto anterior puede haber sido un poco exigente, así que dividir este en secciones más pequeñas podría ayudar. ¿Quieres añadir un checkpoint?",
    pause: "El texto anterior puede haber requerido más concentración, así que un poco más de estructura podría ayudar con el siguiente. ¿Quieres añadir un checkpoint?",
    erratic: "El texto anterior puede haber sido complejo de seguir, y secciones más pequeñas podrían hacer que el siguiente sea más manejable. ¿Quieres añadir un checkpoint?",
    steady: "Esta configuración parece estar funcionando bien para ti. ¿Quieres usar menos checkpoints en esta lectura para tener menos interrupciones?",
    same: "La configuración de checkpoints parece estar funcionando bien. ¿La mantenemos igual para esta lectura?",
  },
  ca: {
    probe: "El text anterior pot haver estat una mica exigent, així que dividir aquest en seccions més petites podria ajudar. Vols afegir un checkpoint?",
    pause: "El text anterior pot haver requerit més concentració, així que una mica més d'estructura podria ajudar amb el següent. Vols afegir un checkpoint?",
    erratic: "El text anterior pot haver estat complex de seguir, i seccions més petites podrien fer que el següent fos més manejable. Vols afegir un checkpoint?",
    steady: "Aquesta configuració sembla que t'està funcionant bé. Vols fer servir menys checkpoints en aquesta lectura per tenir menys interrupcions?",
    same: "La configuració de checkpoints sembla que funciona bé. La mantenim igual per a aquesta lectura?",
  },
};

function normalizeBackupLanguage(language?: string): BackupLanguage {
  if (language?.startsWith("es")) return "es";
  if (language?.startsWith("ca")) return "ca";
  return "en";
}

export function buildBackupCheckpointSuggestion({
  currentCheckpointCount,
  scrollDirectionChanges,
  probeResponse,
  probeResponseTimeMs,
  longestNoScrollMs,
  language,
}: {
  currentCheckpointCount: number;
  scrollDirectionChanges: number;
  probeResponse?: string;
  probeResponseTimeMs?: number | null;
  longestNoScrollMs?: number | null;
  language?: string;
}): BackupCheckpointSuggestion {
  const messages = backupMessages[normalizeBackupLanguage(language)];

  if (probeResponse && probeResponse !== "task-focused") {
    return {
      direction: "more",
      message: messages.probe,
    };
  }

  if (longestNoScrollMs && longestNoScrollMs > 45_000) {
    return {
      direction: "more",
      message: messages.pause,
    };
  }

  if (scrollDirectionChanges >= 4) {
    return {
      direction: "more",
      message: messages.erratic,
    };
  }

  if (
    currentCheckpointCount > 1 &&
    probeResponse === "task-focused" &&
    scrollDirectionChanges <= 1 &&
    (!probeResponseTimeMs || probeResponseTimeMs <= 15_000) &&
    (!longestNoScrollMs || longestNoScrollMs <= 30_000)
  ) {
    return {
      direction: "less",
      message: messages.steady,
    };
  }

  return {
    direction: "same",
    message: messages.same,
  };
}

export function createScrollReadingStats(scrollTop = 0): ScrollReadingStats {
  return {
    startedAt: Date.now(),
    lastTop: scrollTop,
    direction: 0,
    directionChanges: 0,
    scrollEvents: 0,
    maxProgress: 0,
    maxTimeWithoutScrollMs: 0,
  };
}
