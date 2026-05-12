import { Box, Typography } from "@mui/material";
import FormQuestion from "./FormQuestion"
import Stack from '@mui/material/Stack';
import React from "react";
import ColorButton from "../ColorButton";
import { useTranslation } from "react-i18next";

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

function renderDescription(description: string) {
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
                {renderDescription(step.description)}
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
