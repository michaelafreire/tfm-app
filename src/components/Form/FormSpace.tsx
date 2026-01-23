import FormQuestion from "./FormQuestion"
import Stack from '@mui/material/Stack';

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type Step = {
  id: string;
  label: string;
  question: Question[];
};

type FormSpaceProps = {
  steps: Step[];
  currentStep: number;
};

function FormSpace({ steps, currentStep }: FormSpaceProps) {
  return (
    <Stack direction={{ xs: "row", md: "column" }} spacing={3} alignItems="left">
      {steps.map((step, index) => {
        return index === currentStep ? (
          <FormQuestion key={step.id} question={step.question} />
        ) : null;
      })}
    </Stack>

  )
}

export default FormSpace
