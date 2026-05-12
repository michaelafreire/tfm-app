import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ColorButton from "../components/ColorButton";
import type { ExperimentRouteState } from "../experiment/routeState";
import { setCalibrationOffset } from "../webgazer/webgazerManager";

const CALIBRATION_POINTS = [
  { id: "top-left", top: "12%", left: "12%" },
  { id: "top-center", top: "12%", left: "50%" },
  { id: "top-right", top: "12%", left: "88%" },
  { id: "middle-left", top: "50%", left: "12%" },
  { id: "center", top: "50%", left: "50%" },
  { id: "middle-right", top: "50%", left: "88%" },
  { id: "bottom-left", top: "88%", left: "12%" },
  { id: "bottom-center", top: "88%", left: "50%" },
  { id: "bottom-right", top: "88%", left: "88%" },
];

const CLICKS_PER_POINT = 5;
const VALIDATION_POINTS = [
  { id: "validate-upper-left", top: "30%", left: "30%" },
  { id: "validate-upper-right", top: "30%", left: "70%" },
  { id: "validate-lower-left", top: "70%", left: "30%" },
  { id: "validate-lower-right", top: "70%", left: "70%" },
];
const VALIDATION_SAMPLES_PER_POINT = 12;
const VALIDATION_SAMPLE_DELAY_MS = 80;

type CalibrationScore = {
  accuracyPercent: number;
  averageErrorPx: number;
};

function Calibration() {
  const location = useLocation();
  const routeState = (location.state as ExperimentRouteState | null) ?? {};
  const navigate = useNavigate();
  const { t } = useTranslation();
  const participantCode = routeState.participantCode;
  const groupNumber = routeState.groupNumber;
  const nextPath = routeState.nextPath === "/experienceb" ? "/experienceb" : "/experiencea";
  const nextExperienceName = nextPath === "/experienceb" ? t("experienceIntro.titleB") : t("experienceIntro.titleA");

  const [activePointIndex, setActivePointIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accuracy, setAccuracy] = useState<CalibrationScore | null>(null);
  const [activeValidationPointIndex, setActiveValidationPointIndex] = useState<number | null>(null);
  const [showCalibrationPrompt, setShowCalibrationPrompt] = useState(true);
  const [showValidationPrompt, setShowValidationPrompt] = useState(false);
  const calibrationAreaRef = useRef<HTMLDivElement | null>(null);

  const isComplete = activePointIndex >= CALIBRATION_POINTS.length;

  useEffect(() => {
    let cancelled = false;

    const prepareCalibration = async () => {
      setIsPreparing(true);
      setErrorMessage("");

      for (let attempt = 0; attempt < 50; attempt += 1) {
        if (cancelled) return;

        const webgazer = window.webgazer;
        if (webgazer?.isReady?.()) {
          try {
            if ("setVideoViewerSize" in webgazer && typeof webgazer.setVideoViewerSize === "function") {
              webgazer.setVideoViewerSize(160, 120);
            }
            await Promise.resolve(webgazer.clearData());
            webgazer.showVideo(true);
            webgazer.showVideoPreview(true);
            webgazer.showFaceOverlay(true);
            webgazer.showFaceFeedbackBox(true);
            webgazer.showPredictionPoints(true);
            const videoContainer = document.getElementById("webgazerVideoContainer");
            if (videoContainer) {
              videoContainer.style.top = "16px";
              videoContainer.style.left = "16px";
              videoContainer.style.right = "auto";
              videoContainer.style.zIndex = "20";
              videoContainer.style.pointerEvents = "none";
            }
            setIsPreparing(false);
            return;
          } catch (error) {
            console.error("Failed to prepare calibration", error);
            setErrorMessage(t("calibration.prepareError"));
            setIsPreparing(false);
            return;
          }
        }

        await new Promise((resolve) => window.setTimeout(resolve, 150));
      }

      if (!cancelled) {
        setErrorMessage(t("calibration.webcamError"));
        setIsPreparing(false);
      }
    };

    void prepareCalibration();

    return () => {
      cancelled = true;
      const videoContainer = document.getElementById("webgazerVideoContainer");
      if (videoContainer) {
        videoContainer.style.top = "0px";
        videoContainer.style.left = "0px";
        videoContainer.style.right = "auto";
        videoContainer.style.pointerEvents = "auto";
      }
    };
  }, [t]);

  if (!participantCode) {
    return <div>{t("calibration.invalidAccess")}</div>;
  }

  const handleCalibrationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (showCalibrationPrompt || isPreparing || isScoring || isComplete) return;

    const webgazer = window.webgazer;
    if (!webgazer?.isReady?.()) {
      setErrorMessage(t("calibration.warmingUp"));
      return;
    }

    const target = event.currentTarget.getBoundingClientRect();
    const x = target.left + target.width / 2;
    const y = target.top + target.height / 2;

    webgazer.recordScreenPosition(x, y, "click");
    setErrorMessage("");

    const nextClickCount = clickCount + 1;
    const clicksOnCurrentPoint = (nextClickCount % CLICKS_PER_POINT) || CLICKS_PER_POINT;

    if (clicksOnCurrentPoint === CLICKS_PER_POINT) {
      const nextPointIndex = activePointIndex + 1;
      setActivePointIndex(nextPointIndex);

      if (nextPointIndex >= CALIBRATION_POINTS.length) {
        setShowValidationPrompt(true);
      }
    }

    setClickCount(nextClickCount);
  };

  const handleResetCalibration = async () => {
    setActivePointIndex(0);
    setClickCount(0);
    setErrorMessage("");
    setIsPreparing(true);
    setIsScoring(false);
    setAccuracy(null);
    setActiveValidationPointIndex(null);
    setShowCalibrationPrompt(true);
    setShowValidationPrompt(false);

    try {
      await Promise.resolve(window.webgazer?.clearData());
    } catch (error) {
      console.error("Failed to reset calibration", error);
    } finally {
      setIsPreparing(false);
    }
  };

  const handleContinue = () => {
    navigate(nextPath, {
      state: {
        participantCode,
        groupNumber,
        language: routeState.language,
        asrsPartAScore: routeState.asrsPartAScore,
        asrsClassification: routeState.asrsClassification,
        ticksPerReading: routeState.ticksPerReading,
      },
    });
  };

  const handleStartValidation = () => {
    setShowValidationPrompt(false);
    void runCalibrationScore();
  };

  const handleStartCalibration = () => {
    setShowCalibrationPrompt(false);
  };

  const wait = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  const readPrediction = async () => {
    const prediction = window.webgazer?.getCurrentPrediction();
    if (!prediction) return null;
    return prediction;
  };

  const runCalibrationScore = async () => {
    const webgazer = window.webgazer;
    if (!webgazer?.isReady?.()) {
      setErrorMessage(t("calibration.scoreNotReady"));
      return;
    }

    setIsScoring(true);
    setErrorMessage("");
    setCalibrationOffset({ x: 0, y: 0 });

    const pointErrors: number[] = [];
    const xErrors: number[] = [];
    const yErrors: number[] = [];

    const validationAreaRect = calibrationAreaRef.current?.getBoundingClientRect();
    if (validationAreaRect) {
      for (let pointIndex = 0; pointIndex < VALIDATION_POINTS.length; pointIndex += 1) {
        const validationPoint = VALIDATION_POINTS[pointIndex];
        const targetX = validationAreaRect.left + validationAreaRect.width * (parseFloat(validationPoint.left) / 100);
        const targetY = validationAreaRect.top + validationAreaRect.height * (parseFloat(validationPoint.top) / 100);
        const distances: number[] = [];

        setActiveValidationPointIndex(pointIndex);
        await wait(600);

        for (let sampleIndex = 0; sampleIndex < VALIDATION_SAMPLES_PER_POINT; sampleIndex += 1) {
          await wait(VALIDATION_SAMPLE_DELAY_MS);

          const prediction = await readPrediction();
          if (!prediction) continue;

          const dx = prediction.x - targetX;
          const dy = prediction.y - targetY;
          distances.push(Math.hypot(dx, dy));
          xErrors.push(dx);
          yErrors.push(dy);
        }

        if (distances.length > 0) {
          const averageDistance =
            distances.reduce((sum, value) => sum + value, 0) / distances.length;
          pointErrors.push(averageDistance);
        }
      }
    }

    setActiveValidationPointIndex(null);
    setIsScoring(false);

    if (pointErrors.length === 0) {
      setErrorMessage(t("calibration.noPredictions"));
      return;
    }

    const averageErrorPx =
      pointErrors.reduce((sum, value) => sum + value, 0) / pointErrors.length;
    const xOffset = xErrors.length > 0
      ? xErrors.reduce((sum, value) => sum + value, 0) / xErrors.length
      : 0;
    const yOffset = yErrors.length > 0
      ? yErrors.reduce((sum, value) => sum + value, 0) / yErrors.length
      : 0;
    const measurementAreaRect = calibrationAreaRef.current?.getBoundingClientRect();
    const maxDistance = measurementAreaRect
      ? Math.hypot(measurementAreaRect.width, measurementAreaRect.height)
      : Math.hypot(window.innerWidth, window.innerHeight);
    const accuracyPercent = Math.max(
      0,
      Math.min(100, Math.round((1 - averageErrorPx / maxDistance) * 100))
    );

    setAccuracy({
      accuracyPercent,
      averageErrorPx: Math.round(averageErrorPx),
    });
    setCalibrationOffset({ x: xOffset, y: yOffset });
  };

  const completedPoints = Math.floor(clickCount / CLICKS_PER_POINT);
  const clicksOnActivePoint =
    isComplete ? CLICKS_PER_POINT : (clickCount % CLICKS_PER_POINT);
  const topMessage = accuracy
    ? t("calibration.accuracyMessage", { accuracy: accuracy.accuracyPercent, experience: nextExperienceName })
    : isScoring
      ? t("calibration.keepEyesFixed")
      : isPreparing
        ? t("calibration.preparing")
        : t("calibration.clickDots", { count: CLICKS_PER_POINT - clicksOnActivePoint });

  return (
    <Box
      sx={{
        height: "100%",
      }}
    >
      <Box
        sx={{
          borderRadius: 0,
          px: { xs: 2, md: 3 },
          py: 2,
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
            paddingBottom: 2,
            marginBottom: 2,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              gap: 1.5,
              flexWrap: "wrap",
              flex: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <ColorButton
                name={t("common.recalibrate")}
                disabled={isPreparing || isScoring}
                onClick={handleResetCalibration}
              />
              <ColorButton
                name={t("common.continue")}
                disabled={!isComplete || isPreparing || isScoring || showValidationPrompt}
                onClick={handleContinue}
              />
            </Box>
          </Box>
        </Box>

        <Box
          ref={calibrationAreaRef}
          sx={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            backgroundColor: "background.paper",
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              width: "min(76vw, 760px)",
              px: 2.5,
              py: 1.5,
              borderRadius: 3,
              bgcolor: "background.paper",
              boxShadow: "0 8px 30px rgba(38,42,44,0.08)",
              textAlign: "center",
              color: "text.primary",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {topMessage}
            </Typography>
            {errorMessage ? (
              <Typography variant="body2" sx={{ marginTop: 0.75, color: "error.main" }}>
                {errorMessage}
              </Typography>
            ) : null}
            {accuracy ? (
              <Typography variant="body2" sx={{ marginTop: 0.75 }}>
                {t("calibration.averageError", { pixels: accuracy.averageErrorPx })}
              </Typography>
            ) : null}
          </Box>

          {CALIBRATION_POINTS.map((point, index) => {
            const isActive = index === activePointIndex && !isComplete;
            const isDone = index < completedPoints || isComplete;
            const activePointProgress = `${clicksOnActivePoint}/${CLICKS_PER_POINT}`;

            return (
              <Box key={point.id}>
                <Box
                  component="button"
                  type="button"
                  onClick={handleCalibrationClick}
                  disabled={!isActive || isPreparing || showCalibrationPrompt}
                  sx={{
                    position: "absolute",
                    top: point.top,
                    left: point.left,
                    transform: "translate(-50%, -50%)",
                    width: isActive ? 30 : 24,
                    height: isActive ? 30 : 24,
                    borderRadius: "50%",
                    border: "none",
                    cursor: isActive && !isPreparing && !showCalibrationPrompt ? "pointer" : "default",
                    backgroundColor: isDone ? "primary.main" : isActive ? "rgba(59,161,149,0.8)" : "rgba(59,161,149,0.18)",
                    boxShadow: isActive
                      ? "0 0 0 10px rgba(59,161,149,0.16)"
                      : "0 0 0 0 rgba(59,161,149,0)",
                    transition: "all 0.2s ease",
                    opacity: isDone || isActive ? 1 : 0.7,
                  }}
                />
                {isActive && !isPreparing && !showCalibrationPrompt ? (
                  <Typography
                    variant="body2"
                    sx={{
                      position: "absolute",
                      top: point.top,
                      left: point.left,
                      transform: "translate(22px, -50%)",
                      minWidth: 44,
                      px: 1,
                      py: 0.35,
                      borderRadius: 999,
                      bgcolor: "#7b3ff2",
                      color: "#fff",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textAlign: "center",
                      boxShadow: "0 6px 18px rgba(123,63,242,0.26)",
                      pointerEvents: "none",
                    }}
                  >
                    {activePointProgress}
                  </Typography>
                ) : null}
              </Box>
            );
          })}

          {activeValidationPointIndex !== null ? (
            <>
              <Typography
                variant="body1"
                sx={{
                  position: "absolute",
                  top: `calc(${VALIDATION_POINTS[activeValidationPointIndex].top} - 58px)`,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#7b3ff2",
                  fontWeight: 700,
                  textAlign: "center",
                  width: "min(90%, 420px)",
                  pointerEvents: "none",
                }}
              >
                Look at the purple dot
              </Typography>
              <Box
                sx={{
                  position: "absolute",
                  top: VALIDATION_POINTS[activeValidationPointIndex].top,
                  left: VALIDATION_POINTS[activeValidationPointIndex].left,
                  transform: "translate(-50%, -50%)",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "#7b3ff2",
                  boxShadow: "0 0 0 12px rgba(123,63,242,0.2)",
                  pointerEvents: "none",
                }}
              />
            </>
          ) : null}
        </Box>
      </Box>

      <Dialog
        open={showCalibrationPrompt && !isPreparing && !errorMessage}
        disableEscapeKeyDown
        aria-labelledby="calibration-prompt-title"
        PaperProps={{
          sx: {
            width: "min(90vw, 520px)",
            borderRadius: 3,
            bgcolor: "#7b3ff2",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(123,63,242,0.35)",
          },
        }}
      >
        <DialogContent sx={{ px: { xs: 3, sm: 4 }, pt: 4, pb: 1.5 }}>
          <Typography id="calibration-prompt-title" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {t("calibration.startTitle")}
          </Typography>
          <Typography variant="body1">
            {t("calibration.startBody")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", px: 4, pb: 4 }}>
          <Button
            variant="contained"
            onClick={handleStartCalibration}
            sx={{
              minWidth: 96,
              borderRadius: 2,
              bgcolor: "#fff",
              color: "#7b3ff2",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
              },
            }}
          >
            {t("common.ok")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showValidationPrompt}
        disableEscapeKeyDown
        aria-labelledby="validation-prompt-title"
        PaperProps={{
          sx: {
            width: "min(90vw, 420px)",
            borderRadius: 3,
            bgcolor: "#7b3ff2",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(123,63,242,0.35)",
          },
        }}
      >
        <DialogContent sx={{ px: { xs: 3, sm: 4 }, pt: 4, pb: 1.5 }}>
          <Typography id="validation-prompt-title" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {t("calibration.promptTitle")}
          </Typography>
          <Typography variant="body1">
            {t("calibration.promptBody")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", px: 4, pb: 4 }}>
          <Button
            variant="contained"
            onClick={handleStartValidation}
            sx={{
              minWidth: 96,
              borderRadius: 2,
              bgcolor: "#fff",
              color: "#7b3ff2",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
              },
            }}
          >
            {t("common.ok")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Calibration;
