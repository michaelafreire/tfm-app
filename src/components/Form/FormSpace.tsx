import { Typography } from "@mui/material";
import FormQuestion from "./FormQuestion"
import Stack from '@mui/material/Stack';
import React from "react";

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

function FormSpace({ steps, currentStep }: FormSpaceProps) {
  return (
    <>
      {steps.map((step, index) => {
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
            <Typography
              variant="body1"
              sx={{
                marginLeft: 2,
                whiteSpace: "pre-line",
              }}
            >
              {renderDescription(step.description)}
            </Typography>
          </React.Fragment>
        ) : null;
      })}
      <Stack direction="column" spacing={3} alignItems="stretch" sx={{ width: '100%' }}>
        {steps.map((step, index) => {
          return index === currentStep ? (
            <FormQuestion key={step.id} question={step.question} />
          ) : null;
        })}
      </Stack>
    </>
  )
}

export default FormSpace
