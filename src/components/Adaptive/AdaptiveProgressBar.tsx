import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";

type Step = {
  id: string;
  label: string;
};

type AdaptiveProgressBarProps = {
  steps: Step[];
  currentStep: number;
  theme: AdaptiveTheme;
  ticksPerReading: number;
  readingProgressByStep: Record<string, number>;
  completedReadingSteps: Record<string, boolean>;
  paceWarmthByStep?: Record<string, number>;
  shiningTick?: {
    stepId: string;
    tickIndex: number;
  } | null;
};

function AdaptiveProgressBar({
  steps,
  currentStep,
  theme,
  ticksPerReading,
  readingProgressByStep,
  completedReadingSteps,
  paceWarmthByStep = {},
  shiningTick,
}: AdaptiveProgressBarProps) {
  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
          gap: 1.5,
          alignItems: "stretch",
        }}
      >
        {steps.map((step, index) => {
          const isReadingStep = index > 0 && index < steps.length - 1;
          const isCompleted = index < currentStep || completedReadingSteps[step.id] === true;
          const isCurrent = index === currentStep;
          const progress = isCompleted
            ? 100
            : isReadingStep && isCurrent
              ? readingProgressByStep[step.id] ?? 0
              : 0;
          const paceWarmth = isReadingStep && isCurrent
            ? Math.max(0, Math.min(1, paceWarmthByStep[step.id] ?? 0))
            : 0;
          const alertGradient = "linear-gradient(90deg, #f3c969 0%, #f2a65a 48%, #f08c5a 100%)";
          const ticks = isReadingStep ? Array.from({ length: ticksPerReading }, (_, tickIndex) => tickIndex) : [];

          return (
            <Box key={step.id} sx={{ minWidth: 0, pt: 1 }}>
              <Box
                sx={{
                  height: 20,
                  borderRadius: 999,
                  overflow: "visible",
                  position: "relative",
                  backgroundColor: alpha(theme.accent, 0.16),
                  border: `1px solid ${alpha(theme.accent, 0.24)}`,
                  boxShadow: isCurrent ? `0 0 0 2px ${alpha(theme.accent, 0.16)}` : "none",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${Math.max(0, Math.min(progress, 100))}%`,
                    background: theme.gradient,
                    boxShadow: paceWarmth > 0.18 ? "0 0 18px rgba(242, 166, 90, 0.24)" : "none",
                    animation: paceWarmth > 0.18 ? "adaptiveBreathe 2.8s ease-in-out infinite" : "none",
                    transition: "width 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: alertGradient,
                      opacity: paceWarmth,
                      transition: "opacity 0.35s ease",
                    }}
                  />
                </Box>
                {ticks.map((tickIndex) => (
                  <Box
                    key={`${step.id}-tick-${tickIndex}`}
                    sx={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${((tickIndex + 1) / (ticks.length + 1)) * 100}%`,
                      transform: "translateX(-50%)",
                      width: 18,
                      pointerEvents: "none",
                    }}
                  >
                    {shiningTick?.stepId === step.id && shiningTick.tickIndex === tickIndex ? (
                      <Box
                        sx={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 84,
                          height: 40,
                          borderRadius: 999,
                          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.72) 24%, rgba(255,255,255,0.35) 52%, rgba(255,255,255,0) 78%)",
                          filter: "blur(3px)",
                          mixBlendMode: "screen",
                          animation: "tickShine 0.95s ease-out forwards",
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 3,
                        bottom: 3,
                        left: "50%",
                        width: 2,
                        borderRadius: 999,
                        backgroundColor: "rgba(255,255,255,0.85)",
                        transform: "translateX(-50%)",
                        boxShadow:
                          shiningTick?.stepId === step.id && shiningTick.tickIndex === tickIndex
                            ? "0 0 18px rgba(255,255,255,1), 0 0 28px rgba(255,255,255,0.85)"
                            : "none",
                      }}
                    />
                  </Box>
                ))}
                <Box
                  sx={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    backgroundColor: "background.paper",
                    border: `2px solid ${isCurrent || isCompleted ? theme.accent : alpha(theme.accent, 0.35)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: isCurrent || isCompleted ? theme.accent : alpha(theme.accent, 0.75),
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    zIndex: 2,
                  }}
                >
                  {index + 1}
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  mt: 1.75,
                  textAlign: "center",
                  color: isCurrent ? "text.primary" : "text.secondary",
                  fontWeight: isCurrent ? "bold" : 500,
                  fontSize: "0.82rem",
                }}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          "@keyframes adaptiveBreathe": {
            "0%": {
              opacity: 0.9,
              filter: "saturate(0.92) brightness(0.98)",
            },
            "50%": {
              opacity: 1,
              filter: "saturate(1.04) brightness(1.04)",
            },
            "100%": {
              opacity: 0.9,
              filter: "saturate(0.92) brightness(0.98)",
            },
          },
          "@keyframes tickShine": {
            "0%": { opacity: 0, transform: "translate(-50%, -50%) scale(0.5)" },
            "20%": { opacity: 1, transform: "translate(-50%, -50%) scale(0.95)" },
            "55%": { opacity: 0.95, transform: "translate(-50%, -50%) scale(1.08)" },
            "100%": { opacity: 0, transform: "translate(-50%, -50%) scale(1.45)" },
          },
        }}
      />
    </Box>
  );
}

export default AdaptiveProgressBar;
