import { Box, Typography } from "@mui/material";
import FormQuestion from "./FormQuestion"
import Stack from '@mui/material/Stack';
import React from "react";
import ColorButton from "../ColorButton";

type Choice = string;

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

function renderDescription(description: string) {
  const lines = description.split("\n");

  return lines.map((line, lineIndex) => {
    const parts = line.split(/(<strong>.*?<\/strong>)/g).filter(Boolean);

    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {parts.map((part, partIndex) => {
          const match = part.match(/^<strong>(.*?)<\/strong>$/);

          if (match) {
            return <strong key={`part-${lineIndex}-${partIndex}`}>{match[1]}</strong>;
          }

          return <React.Fragment key={`part-${lineIndex}-${partIndex}`}>{part}</React.Fragment>;
        })}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
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
              <Typography
                variant="body1"
                sx={{
                  marginLeft: 2,
                  whiteSpace: "pre-line",
                }}
              >
                {renderDescription(step.description)}
              </Typography>
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
                  name="I have finished reading"
                  disabled={false}
                  onClick={() => onCompleteReadingStep(step.id)}
                />
                <Typography
                  variant="body2"
                  sx={{ marginTop: 1, textAlign: "center" }}
                >
                  Click to continue to the questions.
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
