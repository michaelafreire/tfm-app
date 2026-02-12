import { Box, Typography } from '@mui/material';
import experimentImage from '../assets/experiment.png';
import ColorButton from '../components/ColorButton';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import FormSpace from '../components/Form/FormSpace';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

type Choice = string

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  choice?: Choice[];
  required?: boolean;
};

type Step = {
  id: string;
  label: string;
  description: string;
  question: Question[];
};

function Post() {
  const location = useLocation();
  const participantCode = location.state?.participantCode;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const navigate = useNavigate();
  const [feelings, setFeelings] = useState("");

  if (!participantCode) {
    return <div>Invalid access. Please restart the experiment.</div>;
  }

  async function savePostResponses() {
    return supabase.from("responses").insert([
      {
        participant_code: participantCode,
        phase: "post",
        feelings: feelings,
        // Add other responses here
      }
    ]);
  }

  const steps: Step[] = [
    {
      id: '1',
      label: 'Cognitive Test',
      description: 'Please answer the following questions about your experience during the experiment.',
      question: [
        {
          id: '1-1',
          label: 'Stress levels?',
          type: 'multiple-choice'
        },
        {
          id: '1-2',
          label: 'How do you feel?',
          type: 'text',
          value: feelings,
          onChange: (e) => setFeelings(e.target.value),
          required: true,
        },
      ]
    },
    {
      id: '2',
      label: 'Next Steps',
      description: 'Thank you for participating! Please click "Next" to complete the experiment and receive further instructions.',
      question: [
        { id: '2-1', label: 'Should we keep in touch?', type: 'checkbox' },
      ]
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const { error } = await savePostResponses();

      if (error) {
        console.error(error);
        alert("There was a problem saving your answers. Please contact the researcher.");
        return;
      }

      navigate('/final', { state: { participantCode } });
    }
  };

    const isNextDisabled = () => {
    const step = steps[currentStep];
    if (!step) return false;
    return step.question.some(
      q => q.required && (!q.value || q.value === '')
    );
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
        <ProgressBar steps={steps} currentStep={currentStep} />
      </Box>
      <Box sx={{
        bgcolor: "secondary.paper",
        borderRadius: 3,
        p: 3,
        flex: 3,
        height: { xs: "auto", md: "100%" },
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}>
        <Box sx={{
          flex: 4,
          overflowY: 'auto',
          minHeight: 0,
          position: 'relative',
          // Custom scrollbar styling for WebKit and Firefox
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          scrollbarWidth: 'thin', // Firefox
          scrollbarColor: 'rgba(0,0,0,0.25) transparent', // Firefox
        }}>
          <FormSpace steps={steps} currentStep={currentStep} />
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
            disabled={isNextDisabled()}
            onClick={handleNext}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Post
