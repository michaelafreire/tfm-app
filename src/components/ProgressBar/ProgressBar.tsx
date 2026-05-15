import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import ProgressBarIcon from './ProgressBarIcon';

type Step = {
  id: string;
  label: string;
};

type ProgressBarProps = {
  steps: Step[];
  currentStep: number;
  activeColor?: string;
};


function ProgressBar({ steps, currentStep, activeColor }: ProgressBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
        pt: 0.75,
      }}>
      <Stack direction="row" spacing={{ xs: 0.75, sm: 1.1, md: 1.25 }} alignItems="flex-start">
        {steps.map((step, index) => (
          <ProgressBarIcon
            key={step.id}
            id={step.id}
            label={step.label}
            isActive={index === currentStep}
            isCompleted={index < currentStep}
            showLabel={false}
            activeColor={activeColor}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default ProgressBar
