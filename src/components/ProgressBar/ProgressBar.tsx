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
};


function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "row", md: "column" },
        height: "100%",
        gap: 4,
        alignItems: "left",
        width: { xs: "auto", md: "100%" },
        paddingTop: 4,
      }}>
      <Stack direction={{ xs: "row", md: "column" }} spacing={3} alignItems="left">
        {steps.map((step, index) => (
          <ProgressBarIcon
            key={step.id}
            id={step.id}
            label={step.label}
            isActive={index === currentStep}
            isCompleted={index < currentStep}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default ProgressBar
