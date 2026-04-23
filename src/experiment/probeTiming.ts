const DEFAULT_PROBE_MIN_MS = 105000;
const DEFAULT_PROBE_MAX_MS = 165000;
const DEV_PROBE_MIN_MS = 5000;
const DEV_PROBE_MAX_MS = 10000;

function parseDelay(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function getProbeDelayRange() {
  const envMin = parseDelay(import.meta.env.VITE_PROBE_DELAY_MIN_MS);
  const envMax = parseDelay(import.meta.env.VITE_PROBE_DELAY_MAX_MS);

  if (envMin !== null && envMax !== null) {
    return {
      minMs: Math.min(envMin, envMax),
      maxMs: Math.max(envMin, envMax),
    };
  }

  if (import.meta.env.DEV) {
    return {
      minMs: DEV_PROBE_MIN_MS,
      maxMs: DEV_PROBE_MAX_MS,
    };
  }

  return {
    minMs: DEFAULT_PROBE_MIN_MS,
    maxMs: DEFAULT_PROBE_MAX_MS,
  };
}

export function getRandomProbeDelayMs() {
  const { minMs, maxMs } = getProbeDelayRange();
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}
