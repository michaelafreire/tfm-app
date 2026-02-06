import { Typography } from "@mui/material";
import FormQuestion from "./FormQuestion"
import Stack from '@mui/material/Stack';
import React from "react";

type Choice = string

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  choice?: Choice[];
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
              }}
            >
              {step.description}
            </Typography>
          </React.Fragment>
        ) : null;
      })}
      <Stack direction={{ xs: "row", md: "column" }} spacing={3} alignItems="left">
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
