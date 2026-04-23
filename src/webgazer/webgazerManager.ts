type GazePoint = {
  x: number;
  y: number;
  t: number;
  route: string;
  sectionId?: string;
};

let gazeData: GazePoint[] = [];
let isTracking = false;
let activeSectionId: string | null = null;
let isWebGazerReady = false;

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

// Start recording
export const startTracking = () => {
  gazeData = [];
  isTracking = true;
  void syncTrackingState();
};

// Resume recording without resetting collected data
export const resumeTracking = () => {
  isTracking = true;
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
};

// Labels subsequent gaze points with the active section id
export const setActiveSectionId = (sectionId: string | null) => {
  activeSectionId = sectionId;
};

// Add a gaze point
export const addGazePoint = (point: GazePoint) => {
  if (!isTracking) return;
  gazeData.push({
    ...point,
    sectionId: activeSectionId ?? undefined,
  });
};

// Get all data
export const getGazeData = () => gazeData;
