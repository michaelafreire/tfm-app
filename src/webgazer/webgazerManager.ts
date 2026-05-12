type GazePoint = {
  rawX?: number;
  rawY?: number;
  x: number;
  y: number;
  t: number;
  route: string;
  sectionId?: string;
  aoi?: "progress" | "reading" | "screen_tut" | "outside" | "missing_prediction";
};

type AoiRect = {
  id: "progress" | "reading";
  rect: DOMRect;
};

const SAMPLE_INTERVAL_MS = 100;
const STEP_WARMUP_MS = 1000;
const SMOOTHING_ALPHA = 0.35;
const MAX_JUMP_PX = 280;

let gazeData: GazePoint[] = [];
let isTracking = false;
let activeSectionId: string | null = null;
let isWebGazerReady = false;
let latestPrediction: GazePoint | null = null;
let sampleTimerId: number | null = null;
let smoothedPoint: Pick<GazePoint, "x" | "y" | "t"> | null = null;
let ignoreSamplesUntil = 0;
let aoiRects: AoiRect[] = [];
let missingSampleCountBySection: Record<string, number> = {};
let usablePredictionSeenBySection: Record<string, boolean> = {};
let calibrationOffset = { x: 0, y: 0 };
let currentRoute = "/";

const syncTrackingState = async () => {
  const webgazer = window.webgazer;

  if (!webgazer || !isWebGazerReady) return;

  try {
    await Promise.resolve(webgazer.resume());
  } catch (error) {
    console.error("Failed to sync WebGazer tracking state", error);
  }
};

export const setWebGazerReady = (ready: boolean) => {
  isWebGazerReady = ready;
  void syncTrackingState();
};

const classifyAoi = (x: number, y: number): GazePoint["aoi"] => {
  const matchingRect = aoiRects.find(({ rect }) => (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  ));

  if (matchingRect) return matchingRect.id;
  if (x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight) return "screen_tut";
  return "outside";
};

const sampleLatestPrediction = () => {
  if (!isTracking) return;

  const now = Date.now();
  if (now < ignoreSamplesUntil) return;
  const hasSeenUsablePrediction = activeSectionId ? usablePredictionSeenBySection[activeSectionId] === true : false;

  if (!latestPrediction || now - latestPrediction.t > 250) {
    if (!hasSeenUsablePrediction) return;

    if (activeSectionId) {
      missingSampleCountBySection[activeSectionId] = (missingSampleCountBySection[activeSectionId] ?? 0) + 1;
    }
    gazeData.push({
      x: Number.NaN,
      y: Number.NaN,
      t: now,
      route: currentRoute,
      sectionId: activeSectionId ?? undefined,
      aoi: "missing_prediction",
    });
    return;
  }

  const rawPoint = {
    ...latestPrediction,
    x: latestPrediction.x - calibrationOffset.x,
    y: latestPrediction.y - calibrationOffset.y,
  };

  if (smoothedPoint) {
    const elapsedMs = Math.max(1, rawPoint.t - smoothedPoint.t);
    const jumpDistance = Math.hypot(rawPoint.x - smoothedPoint.x, rawPoint.y - smoothedPoint.y);
    if (jumpDistance > Math.max(MAX_JUMP_PX, elapsedMs * 1.8)) {
      if (!hasSeenUsablePrediction) return;

      if (activeSectionId) {
        missingSampleCountBySection[activeSectionId] = (missingSampleCountBySection[activeSectionId] ?? 0) + 1;
      }
      gazeData.push({
        rawX: rawPoint.x,
        rawY: rawPoint.y,
        x: Number.NaN,
        y: Number.NaN,
        t: now,
        route: rawPoint.route,
        sectionId: activeSectionId ?? undefined,
        aoi: "missing_prediction",
      });
      return;
    }
  }

  const nextSmoothedPoint = smoothedPoint
    ? {
      x: smoothedPoint.x + SMOOTHING_ALPHA * (rawPoint.x - smoothedPoint.x),
      y: smoothedPoint.y + SMOOTHING_ALPHA * (rawPoint.y - smoothedPoint.y),
      t: rawPoint.t,
    }
    : {
      x: rawPoint.x,
      y: rawPoint.y,
      t: rawPoint.t,
    };

  smoothedPoint = nextSmoothedPoint;
  if (activeSectionId) {
    usablePredictionSeenBySection[activeSectionId] = true;
  }

  const point = {
    rawX: latestPrediction.x,
    rawY: latestPrediction.y,
    x: nextSmoothedPoint.x,
    y: nextSmoothedPoint.y,
    t: now,
    route: rawPoint.route,
    sectionId: activeSectionId ?? undefined,
    aoi: classifyAoi(nextSmoothedPoint.x, nextSmoothedPoint.y),
  };

  gazeData.push(point);
};

const ensureSampleTimer = () => {
  if (sampleTimerId !== null) return;
  sampleTimerId = window.setInterval(sampleLatestPrediction, SAMPLE_INTERVAL_MS);
};

const stopSampleTimer = () => {
  if (sampleTimerId === null) return;
  window.clearInterval(sampleTimerId);
  sampleTimerId = null;
};

// Start recording
export const startTracking = () => {
  gazeData = [];
  missingSampleCountBySection = {};
  usablePredictionSeenBySection = {};
  isTracking = true;
  smoothedPoint = null;
  ignoreSamplesUntil = Date.now() + STEP_WARMUP_MS;
  ensureSampleTimer();
  void syncTrackingState();
};

// Resume recording without resetting collected data
export const resumeTracking = () => {
  isTracking = true;
  ensureSampleTimer();
  void syncTrackingState();
};

// Pause recording without clearing collected data
export const pauseTracking = () => {
  isTracking = false;
};

// Stop recording
export const stopTracking = () => {
  isTracking = false;
  activeSectionId = null;
  latestPrediction = null;
  smoothedPoint = null;
  stopSampleTimer();
};

// Labels subsequent gaze points with the active section id
export const setActiveSectionId = (sectionId: string | null) => {
  if (activeSectionId !== sectionId) {
    ignoreSamplesUntil = Date.now() + STEP_WARMUP_MS;
    smoothedPoint = null;
    latestPrediction = null;
  }
  activeSectionId = sectionId;
};

export const setAoiRects = (rects: AoiRect[]) => {
  aoiRects = rects;
};

export const getMissingSampleCount = (sectionId: string) => missingSampleCountBySection[sectionId] ?? 0;

export const setCalibrationOffset = (offset: { x: number; y: number }) => {
  calibrationOffset = offset;
  smoothedPoint = null;
};

export const setCurrentRoute = (route: string) => {
  currentRoute = route;
};

// Add a gaze point
export const addGazePoint = (point: GazePoint) => {
  latestPrediction = point;
};

// Get all data
export const getGazeData = () => gazeData;
