import { Box, Typography } from "@mui/material";
import FormQuestion from "./FormQuestion"
import Stack from '@mui/material/Stack';
import React from "react";
import ColorButton from "../ColorButton";
import { useTranslation } from "react-i18next";
import { alpha } from "@mui/material/styles";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";
import { getMarkerColor, type MarkerStyle } from "../Adaptive/AdaptiveProgressBar";
import type { CheckpointPlacement } from "../../services/adaptiveAI";

type Choice = string | { value: string; label: string };

type LikertRow = {
  id: string;
  label: string;
  value?: string;
};

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number' | 'date' | 'likert-group';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (value: string) => void;
  choice?: Choice[];

  // Likert additions
  likertRows?: LikertRow[];
  likertLabels?: string[];
  likertMinLabel?: string;
  likertMaxLabel?: string;
  onMatrixChange?: (rowId: string, value: string) => void;

  required?: boolean;
};

type Step = {
  id: string;
  label: string;
  description: string;
  question: Question[];
};

type FormSpaceProps = {
  steps: Step[];
  currentStep: number;
  completedReadingSteps?: Record<string, boolean>;
  onCompleteReadingStep?: (stepId: string) => void;
  checkpointCountsByStep?: Record<string, number>;
  completedCheckpointsByStep?: Record<string, number>;
  markerStyle?: MarkerStyle;
  adaptiveTheme?: AdaptiveTheme;
  checkpointPlacementsByStep?: Record<string, CheckpointPlacement[]>;
  shiningCheckpoint?: {
    stepId: string;
    checkpointIndex: number;
  } | null;
};

function renderInlineStrong(text: string) {
  const parts = text.split(/(<strong>.*?<\/strong>|\*\*.*?\*\*)/g).filter(Boolean);

  return parts.map((part, partIndex) => {
    const htmlStrong = part.match(/^<strong>(.*?)<\/strong>$/);
    const markdownStrong = part.match(/^\*\*(.*?)\*\*$/);
    const strongText = htmlStrong?.[1] ?? markdownStrong?.[1];

    if (strongText) {
      return <strong key={`strong-${partIndex}`}>{strongText}</strong>;
    }

    return <React.Fragment key={`text-${partIndex}`}>{part}</React.Fragment>;
  });
}

function MarkerIcon({ style, size = 20 }: { style: MarkerStyle; size?: number }) {
  const sx = { fontSize: size, display: "block" };
  if (style === "heart") return <FavoriteRoundedIcon sx={sx} />;
  if (style === "star") return <StarRoundedIcon sx={sx} />;
  return <DiamondRoundedIcon sx={sx} />;
}

function CheckpointDivider({
  checkpointIndex,
  isReached,
  isShining,
  markerStyle,
  theme,
}: {
  checkpointIndex: number;
  isReached: boolean;
  isShining: boolean;
  markerStyle: MarkerStyle;
  theme: AdaptiveTheme;
}) {
  const markerColor = getMarkerColor(markerStyle, theme);

  return (
    <Box
      sx={{
        my: 3,
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 1.5,
        color: isReached ? markerColor : alpha(markerColor, 0.5),
        animation: isShining ? "inlineCheckpointShine 0.9s ease-out" : "none",
        "@keyframes inlineCheckpointShine": {
          "0%": { transform: "scale(0.98)", filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" },
          "35%": { transform: "scale(1.02)", filter: `drop-shadow(0 0 16px ${alpha(markerColor, 0.75)})` },
          "100%": { transform: "scale(1)", filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" },
        },
      }}
    >
      <Box sx={{ height: 2, bgcolor: alpha(markerColor, isReached ? 0.34 : 0.16) }} />
      <Box
        sx={{
          px: 2,
          py: 0.65,
          borderRadius: 999,
          bgcolor: alpha(markerColor, isReached ? 0.12 : 0.06),
          border: `1px solid ${alpha(markerColor, isReached ? 0.24 : 0.13)}`,
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          fontWeight: 700,
          fontSize: "0.78rem",
          color: isReached ? markerColor : "text.secondary",
          whiteSpace: "nowrap",
        }}
      >
        <MarkerIcon style={markerStyle} size={18} />
        Checkpoint {checkpointIndex + 1}: key idea complete
      </Box>
      <Box sx={{ height: 2, bgcolor: alpha(markerColor, isReached ? 0.34 : 0.16) }} />
    </Box>
  );
}

function renderDescription(
  description: string,
  checkpointOptions?: {
    stepId: string;
    checkpointCount: number;
    completedCheckpointCount: number;
    placements?: CheckpointPlacement[];
    markerStyle: MarkerStyle;
    theme: AdaptiveTheme;
    shiningCheckpoint?: {
      stepId: string;
      checkpointIndex: number;
    } | null;
  },
) {
  const lines = description.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) {
      nodes.push(<Box key={`space-${index}`} sx={{ height: 10 }} />);
      continue;
    }

    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      nodes.push(
        <Typography key={`heading-${index}`} variant="body1" sx={{ fontWeight: 700, mt: 1.5, mb: 0.5 }}>
          {renderInlineStrong(heading[1])}
        </Typography>
      );
      continue;
    }

    if (line.startsWith("* ")) {
      const items: string[] = [];
      let bulletIndex = index;

      while (bulletIndex < lines.length && lines[bulletIndex].trim().startsWith("* ")) {
        items.push(lines[bulletIndex].trim().slice(2));
        bulletIndex += 1;
      }

      nodes.push(
        <Box
          component="ul"
          key={`bullets-${index}`}
          sx={{ mt: 0.5, mb: 1.5, pl: 4, "& li": { mb: 0.35 } }}
        >
          {items.map((item, itemIndex) => (
            <Box component="li" key={`bullet-${index}-${itemIndex}`}>
              {renderInlineStrong(item)}
            </Box>
          ))}
        </Box>
      );
      index = bulletIndex - 1;
      continue;
    }

    nodes.push(
      <Typography key={`paragraph-${index}`} variant="body1" sx={{ mb: 1.5, lineHeight: 1.45 }}>
        {renderInlineStrong(line)}
      </Typography>
    );
  }

  if (checkpointOptions && checkpointOptions.checkpointCount > 1 && nodes.length > 1) {
    const dividerCount = checkpointOptions.checkpointCount - 1;
    const placements = checkpointOptions.placements?.slice(0, dividerCount) ?? [];
    const insertAfterIndexes = new Set(
      placements.length > 0
        ? placements.map((placement) =>
            Math.max(0, Math.min(nodes.length - 2, placement.afterParagraph - 1))
          )
        : Array.from({ length: dividerCount }, (_, index) =>
            Math.max(0, Math.min(nodes.length - 2, Math.round(((index + 1) * nodes.length) / checkpointOptions.checkpointCount) - 1))
          )
    );
    const checkpointNodes: React.ReactNode[] = [];
    let checkpointIndex = 0;

    nodes.forEach((node, nodeIndex) => {
      checkpointNodes.push(node);
      if (insertAfterIndexes.has(nodeIndex) && checkpointIndex < dividerCount) {
        checkpointNodes.push(
          <CheckpointDivider
            key={`checkpoint-divider-${checkpointIndex}`}
            checkpointIndex={checkpointIndex}
            isReached={checkpointOptions.completedCheckpointCount > checkpointIndex}
            isShining={
              checkpointOptions.shiningCheckpoint?.stepId === checkpointOptions.stepId &&
              checkpointOptions.shiningCheckpoint.checkpointIndex === checkpointIndex
            }
            markerStyle={checkpointOptions.markerStyle}
            theme={checkpointOptions.theme}
          />
        );
        checkpointIndex += 1;
      }
    });

    return checkpointNodes;
  }

  return nodes;
}

function isReadingStep(step: Step) {
  return step.question[0]?.id ? /_R\d+_/.test(step.question[0].id) : false;
}

function FormSpace({
  steps,
  currentStep,
  completedReadingSteps = {},
  onCompleteReadingStep = () => {},
  checkpointCountsByStep = {},
  completedCheckpointsByStep = {},
  markerStyle = "diamond",
  adaptiveTheme,
  checkpointPlacementsByStep = {},
  shiningCheckpoint = null,
}: FormSpaceProps) {
  const { t } = useTranslation();

  return (
    <>
      {steps.map((step, index) => {
        const readingStep = isReadingStep(step);
        const readingCompleted = completedReadingSteps[step.id] === true;

        return index === currentStep ? (
          <React.Fragment key={step.id}>
            <Typography
              variant="body1"
              sx={{
                marginLeft: 2,
                marginTop: 4,
                color: "primary.main",
                fontWeight: "bold",
              }}>
              {step.label.toUpperCase()}
            </Typography>
            {(!readingStep || !readingCompleted) && (
              <Box
                sx={{
                  marginLeft: 2,
                }}
              >
                {renderDescription(
                  step.description,
                  readingStep && adaptiveTheme
                    ? {
                        stepId: step.id,
                        checkpointCount: checkpointCountsByStep[step.id] ?? 0,
                        completedCheckpointCount: completedCheckpointsByStep[step.id] ?? 0,
                        placements: checkpointPlacementsByStep[step.id],
                        markerStyle,
                        theme: adaptiveTheme,
                        shiningCheckpoint,
                      }
                    : undefined,
                )}
              </Box>
            )}
            {readingStep && !readingCompleted && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 10,
                }}
              >
                <ColorButton
                  name={t("form.finishedReading")}
                  disabled={false}
                  onClick={() => onCompleteReadingStep(step.id)}
                />
                <Typography
                  variant="body2"
                  sx={{ marginTop: 1, textAlign: "center" }}
                >
                  {t("form.clickToQuestions")}
                </Typography>
              </Box>
            )}
          </React.Fragment>
        ) : null;
      })}
      <Stack direction="column" spacing={3} alignItems="stretch" sx={{ width: '100%' }}>
        {steps.map((step, index) => {
          return index === currentStep && (!isReadingStep(step) || completedReadingSteps[step.id]) ? (
            <React.Fragment key={step.id}>
              <FormQuestion question={step.question} />
            </React.Fragment>
          ) : null;
        })}
      </Stack>
    </>
  )
}

export default FormSpace
