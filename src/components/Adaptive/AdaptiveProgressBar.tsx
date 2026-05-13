import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import { useTranslation } from "react-i18next";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";

export type MarkerStyle = "diamond" | "heart" | "star";

export function getMarkerColor(style: MarkerStyle, theme: AdaptiveTheme) {
  if (style === "heart") return "#f06292";
  if (style === "star") return "#f6c85f";
  return theme.accent;
}

const attentionWarningColor = "#9a031e";

type Step = {
  id: string;
  label: string;
};

type AdaptiveProgressBarProps = {
  steps: Step[];
  currentStep: number;
  theme: AdaptiveTheme;
  checkpointCountsByStep: Record<string, number>;
  completedCheckpointsByStep: Record<string, number>;
  markerStyle: MarkerStyle;
  markerDimByStep?: Record<string, number>;
  shiningCheckpoint?: {
    stepId: string;
    checkpointIndex: number;
  } | null;
};

function MarkerIcon({ style, size = 18 }: { style: MarkerStyle; size?: number }) {
  const sx = { fontSize: size, display: "block" };
  if (style === "heart") return <FavoriteRoundedIcon sx={sx} />;
  if (style === "star") return <StarRoundedIcon sx={sx} />;
  return <DiamondRoundedIcon sx={sx} />;
}

function AdaptiveProgressBar({
  steps,
  currentStep,
  theme,
  checkpointCountsByStep,
  completedCheckpointsByStep,
  markerStyle,
  markerDimByStep = {},
  shiningCheckpoint,
}: AdaptiveProgressBarProps) {
  const { t } = useTranslation();
  const readingSteps = steps.filter((step) => /_R\d+_/.test(step.id) || ["2", "3", "4"].includes(step.id));

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: `repeat(${Math.max(readingSteps.length, 1)}, minmax(0, 1fr))`,
          },
          gap: 1.5,
          alignItems: "stretch",
        }}
      >
        {readingSteps.map((step, readingIndex) => {
          const stepIndex = steps.findIndex((candidate) => candidate.id === step.id);
          const isCurrent = stepIndex === currentStep;
          const total = checkpointCountsByStep[step.id] ?? 3;
          const completed = Math.min(completedCheckpointsByStep[step.id] ?? 0, total);
          const dimAmount = Math.max(0, Math.min(1, markerDimByStep[step.id] ?? 0));
          const warningColor = alpha(attentionWarningColor, 0.5 + dimAmount * 0.45);
          const activeColor = dimAmount > 0 ? warningColor : theme.accent;
          const checkpoints = Array.from({ length: total }, (_, index) => index);

          return (
            <Box
              key={step.id}
              sx={{
                minWidth: 0,
                borderRadius: 2,
                bgcolor: "background.paper",
                border: `1px solid ${isCurrent ? activeColor : alpha(theme.accent, 0.18)}`,
                boxShadow: isCurrent ? `0 0 0 2px ${dimAmount > 0 ? alpha(attentionWarningColor, 0.16 + dimAmount * 0.1) : alpha(theme.accent, 0.18)}` : "none",
                p: 1.25,
                textAlign: "center",
                transition: "border-color 900ms ease, box-shadow 900ms ease",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: isCurrent ? activeColor : "text.primary",
                  fontWeight: 700,
                  mb: 1,
                  transition: "color 900ms ease",
                }}
              >
                {t("adaptive.readingLabel", { number: readingIndex + 1 })}
              </Typography>

              <Box
                sx={{
                  position: "relative",
                  mx: "auto",
                  width: "100%",
                  maxWidth: 150,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 11,
                    right: 11,
                    top: "50%",
                    height: 2,
                    transform: "translateY(-50%)",
                    bgcolor: dimAmount > 0 ? alpha(attentionWarningColor, 0.18 + dimAmount * 0.18) : alpha(theme.accent, 0.22),
                    transition: "background-color 900ms ease",
                  },
                }}
              >
                {checkpoints.map((checkpointIndex) => {
                  const markerColor = getMarkerColor(markerStyle, theme);
                  const dimmedMarkerColor = dimAmount > 0 ? alpha(attentionWarningColor, 0.46 + dimAmount * 0.44) : alpha(markerColor, 0.46);
                  const activeMarkerColor = dimAmount > 0 ? alpha(attentionWarningColor, 0.55 + dimAmount * 0.35) : markerColor;
                  const isDone = checkpointIndex < completed;
                  const isShining =
                    shiningCheckpoint?.stepId === step.id &&
                    shiningCheckpoint.checkpointIndex === checkpointIndex;

                  return (
                    <Box
                      key={`${step.id}-${checkpointIndex}`}
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isDone ? activeMarkerColor : dimmedMarkerColor,
                        filter: isShining ? "drop-shadow(0 0 12px rgba(255,255,255,0.95))" : "none",
                        animation: isShining ? "checkpointShine 0.95s ease-out" : "none",
                        transition: "color 900ms ease",
                      }}
                    >
                      <MarkerIcon style={markerStyle} />
                    </Box>
                  );
                })}
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                {t("adaptive.completedOfTotal", { completed, total })}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          "@keyframes checkpointShine": {
            "0%": { transform: "scale(0.75)", opacity: 0.55 },
            "35%": { transform: "scale(1.35)", opacity: 1 },
            "100%": { transform: "scale(1)", opacity: 1 },
          },
        }}
      />
    </Box>
  );
}

export default AdaptiveProgressBar;
