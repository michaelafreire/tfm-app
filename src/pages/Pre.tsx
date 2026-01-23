import { Box, Typography } from '@mui/material';
import experimentImage from '../assets/experiment.png';
import ColorButton from '../components/ColorButton';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import FormSpace from '../components/Form/FormSpace';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

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

function Pre() {
  const location = useLocation();
  const navigate = useNavigate();
  const participantCode = location.state?.participantCode;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [initials, setInitials] = useState("");

  if (!participantCode) {
    return <div>Invalid access. Please restart the experiment.</div>;
  }

  async function savePreResponses() {
    return supabase.from("responses").insert([
      {
        participant_code: participantCode,
        phase: "pre",
        initials: initials,
        // Add other responses here
      }
    ]);
  }

  const steps: Step[] = [
    {
      id: '1',
      label: 'Consent Form',
      question: [
        {
          id: '1-1',
          label: 'Do you consent to participate in this experiment?',
          type: 'checkbox'
        },
        {
          id: '1-2',
          label: 'Please provide your initials:',
          type: 'text',
          value: initials,
          onChange: (e) => setInitials(e.target.value),
        },
      ]
    },
    {
      id: '2',
      label: 'About you',
      question: [
        {
          id: '2-1',
          label: 'What is your age?',
          type: 'number'
        },
      ]
    },
    {
      id: '3',
      label: 'Cognitive Test',
      question: [
        {
          id: '3-1',
          label: 'Have you taken a cognitive test before?',
          type: 'multiple-choice'
        },
      ]
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const { error } = await savePreResponses();

      if (error) {
        console.error(error);
        alert("There was a problem saving your answers. Please contact the researcher.");
        return;
      }

      navigate('/experience', { state: { participantCode } });
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
          Pre-experiment Questions
        </Typography>
        <ProgressBar steps={steps} currentStep={currentStep} />
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
            disabled={false}
            onClick={handleNext}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Pre
