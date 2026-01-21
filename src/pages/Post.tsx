import { Box, Typography } from '@mui/material';
import experimentImage from '../assets/experiment.png';
import ColorButton from '../components/ColorButton';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormSpace from '../components/Form/FormSpace';

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number';
};

type Step = {
  id: string;
  label: string;
  question: Question[];
};

function Post() {
  const steps: Step[] = [
    { id: '1',
      label: 'Cognitive Test',
      question: [
        { id: '1-1', label: 'Stress levels?', type: 'multiple-choice' },
        { id: '1-2', label: 'Why?', type: 'text' },
      ]},
    { id: '2',
      label: 'Next Steps',
      question: [
        { id: '2-1', label: 'Should we keep in touch?', type: 'checkbox' },
      ] },
  ];

    const [currentStep, setCurrentStep] = useState<number>(0);

    const navigate = useNavigate();

    const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1); // move to next step
    } else {
      navigate('/final'); // if last step, go to next page
    }
    };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100%",
        gap: 1,
      }}>
      <Box sx={{
        bgcolor: "secondary.main",
        borderRadius: 3,
        p: 3,
        flex: 1,
        height: { xs: "auto", md: "100%" },
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}>
        <img src={experimentImage} alt="App Logo" style={{ width: 35, height: "auto" }} />
        <Typography variant="body1" sx={{ marginTop: 2, fontWeight: 'bold' }}>
          Post-experiment Questions
        </Typography>
        <ProgressBar steps={steps} currentStep={currentStep}/>
      </Box>
      <Box sx={{
        bgcolor: "secondary.paper",
        borderRadius: 3,
        p: 3,
        flex: 3,
        height: { xs: "auto", md: "100%" },
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}>
        <Box sx={{
          flex: 4,
        }}>
          <FormSpace steps={steps} currentStep={currentStep}/>
        </Box>
        <Box sx={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}>
          <ColorButton
            name="Next"
            onClick={handleNext}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Post
