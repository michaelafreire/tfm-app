import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { loadWebGazer } from "../webgazer/loadWebgazer";
import { addGazePoint, setWebGazerReady } from "../webgazer/webgazerManager";

type WebGazerMode = "calibration" | "tracking" | "inactive";

export function useWebGazer() {
  const location = useLocation();
  const webgazerRef = useRef<NonNullable<Window["webgazer"]> | null>(null);
  const initializedRef = useRef(false);
  const routeRef = useRef(location.pathname);
  const webGazerMode: WebGazerMode =
    location.pathname === "/calibration"
      ? "calibration"
      : location.pathname === "/experiencea" || location.pathname === "/experienceb"
        ? "tracking"
        : "inactive";
  const webGazerModeRef = useRef(webGazerMode);

  const applyRoutePresentation = (
    webgazer: NonNullable<Window["webgazer"]>,
    mode: WebGazerMode
  ) => {
    if (mode === "calibration") {
      webgazer.showVideo(true);
      webgazer.showVideoPreview(true);
      webgazer.showFaceOverlay(true);
      webgazer.showFaceFeedbackBox(true);
      webgazer.showPredictionPoints(true);
      return;
    }

    if (mode === "tracking") {
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);
      webgazer.showVideoPreview(false);
      webgazer.showVideo(false);
      webgazer.showPredictionPoints(true);
      void Promise.resolve(webgazer.resume());
      return;
    }

    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);
    webgazer.showPredictionPoints(false);
    webgazer.showVideoPreview(false);
    webgazer.showVideo(false);
  };

  useEffect(() => {
    routeRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    webGazerModeRef.current = webGazerMode;
  }, [webGazerMode]);

  useEffect(() => {
    let disposed = false;

    const init = async () => {
      try {
        const webgazer = await loadWebGazer();

        if (disposed || !webgazer) return;

        webgazerRef.current = webgazer;

        // WebGazer 3.5.x tracker keys are case-sensitive.
        webgazer.params.faceMeshSolutionPath = `${import.meta.env.BASE_URL}mediapipe/face_mesh`;

        webgazer
          .setTracker("TFFacemesh")
          .setGazeListener((data: { x: number; y: number } | null) => {
            if (!data) return;
            addGazePoint({
              x: data.x,
              y: data.y,
              t: Date.now(),
              route: routeRef.current,
            });
          });

        initializedRef.current = true;

        if (webGazerModeRef.current !== "inactive") {
          if (!webgazer.isReady?.()) {
            await Promise.resolve(webgazer.begin());
          }
          setWebGazerReady(true);
          applyRoutePresentation(webgazer, webGazerModeRef.current);
        } else {
          applyRoutePresentation(webgazer, "inactive");
          setWebGazerReady(false);
          webgazer.pause();
        }

      } catch (error) {
        setWebGazerReady(false);
        console.error("Failed to initialize WebGazer", error);
      }
    };

    void init();

    return () => {
      disposed = true;

      const webgazer = webgazerRef.current;

      if (!initializedRef.current || !webgazer) return;

      try {
        setWebGazerReady(false);
        webgazer.showPredictionPoints(false);
        webgazer.showVideo(false);
        webgazer.pause();
      } catch (error) {
        console.error("Failed to stop WebGazer cleanly", error);
      }
    };
  }, []);

  useEffect(() => {
    const webgazer = webgazerRef.current;

    if (!initializedRef.current || !webgazer) return;

    if (webGazerModeRef.current !== "inactive") {
      void Promise.resolve(
        webgazer.isReady?.() ? webgazer : webgazer.begin()
      )
        .then(() => {
          setWebGazerReady(true);
          applyRoutePresentation(webgazer, webGazerModeRef.current);
        })
        .catch((error) => {
          setWebGazerReady(false);
          console.error("Failed to resume WebGazer", error);
        });
      return;
    }

    applyRoutePresentation(webgazer, "inactive");
    setWebGazerReady(false);
    webgazer.pause();
  }, [webGazerMode]);
}
