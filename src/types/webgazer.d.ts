type WebGazerData = {
  x: number;
  y: number;
};

interface WebGazerInstance {
  params: any;
  setTracker(tracker: string): WebGazerInstance;
  setGazeListener(
    listener: (data: WebGazerData | null, timestamp: number) => void
  ): WebGazerInstance;
  begin(): WebGazerInstance | Promise<WebGazerInstance>;
  showVideo(show: boolean): WebGazerInstance;
  showVideoPreview(show: boolean): WebGazerInstance;
  showFaceOverlay(show: boolean): WebGazerInstance;
  showFaceFeedbackBox(show: boolean): WebGazerInstance;
  showPredictionPoints(show: boolean): WebGazerInstance;
  setVideoViewerSize?(width: number, height: number): WebGazerInstance;
  resume(): WebGazerInstance | Promise<WebGazerInstance>;
  pause(): void;
  clearData(): void | Promise<void>;
  recordScreenPosition(x: number, y: number, eventType?: string): WebGazerInstance;
  getCurrentPrediction(index?: number): WebGazerData | null;
  isReady?(): boolean;
}

declare global {
  interface Window {
    webgazer?: WebGazerInstance;
  }
}

export {};
