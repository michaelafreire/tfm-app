import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";

export type MarkerStyle = "diamond" | "heart" | "star";

export function getMarkerColor(style: MarkerStyle, theme: AdaptiveTheme) {
  if (style === "heart") return "#f06292";
  if (style === "star") return "#f6c85f";
  return theme.accent;
}

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
  shiningCheckpoint,
}: AdaptiveProgressBarProps) {
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
          const checkpoints = Array.from({ length: total }, (_, index) => index);

          return (
            <Box
              key={step.id}
              sx={{
                minWidth: 0,
                borderRadius: 2,
                bgcolor: "background.paper",
                border: `1px solid ${isCurrent ? theme.accent : alpha(theme.accent, 0.18)}`,
                boxShadow: isCurrent ? `0 0 0 2px ${alpha(theme.accent, 0.18)}` : "none",
                p: 1.25,
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: isCurrent ? theme.accent : "text.primary",
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Reading {readingIndex + 1}
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
                    bgcolor: alpha(theme.accent, 0.22),
                  },
                }}
              >
                {checkpoints.map((checkpointIndex) => {
                  const markerColor = getMarkerColor(markerStyle, theme);
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
                        color: isDone ? markerColor : alpha(markerColor, 0.46),
                        filter: isShining ? "drop-shadow(0 0 12px rgba(255,255,255,0.95))" : "none",
                        animation: isShining ? "checkpointShine 0.95s ease-out" : "none",
                      }}
                    >
                      <MarkerIcon style={markerStyle} />
                    </Box>
                  );
                })}
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                {completed} of {total}
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
