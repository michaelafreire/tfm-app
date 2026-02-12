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

function Pre() {
  const location = useLocation();
  const navigate = useNavigate();
  const participantCode = location.state?.participantCode;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [initials, setInitials] = useState("");
  const [ASRS1, setASRS1] = useState("");
  const [ASRS2, setASRS2] = useState("");
  const [ASRS3, setASRS3] = useState("");
  const [ASRS4, setASRS4] = useState("");
  const [ASRS5, setASRS5] = useState("");
  const [ASRS6, setASRS6] = useState("");
  if (!participantCode) {
    return <div>Invalid access. Please restart the experiment.</div>;
  }

  async function savePreResponses() {
    return supabase.from("responses").insert([
      {
        participant_code: participantCode,
        phase: "pre",
        initials: initials,
        ASRS1: ASRS1,
        ASRS2: ASRS2,
        ASRS3: ASRS3,
        ASRS4: ASRS4,
        ASRS5: ASRS5,
        ASRS6: ASRS6,
        // Add other responses here
      }
    ]);
  }

  const steps: Step[] = [
    {
      id: '1',
      label: 'Consent Form',
      description: 'Please read the consent form carefully and provide your initials to indicate your agreement to participate in this experiment.',
      question: [
        {
          id: '1-1',
          label: 'Do you consent to participate in this experiment?',
          type: 'checkbox',
        },
        {
          id: '1-2',
          label: 'Please provide your initials:',
          type: 'text',
          value: initials,
          onChange: (e) => setInitials(e.target.value),
          required: true,
        },
      ]
    },
    {
      id: '2',
      label: 'About you',
      description: 'Please answer the following questions about yourself.',
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
      label: 'Adult Self-Report Scale',
      description: "Check the box that best describes how you have felt and conducted yourself over the past 6 months.",
      question: [
        {
          id: '3-1',
          label: '1. How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
          type: 'multiple-choice',
          value: ASRS1,
          onChange: (e) => setASRS1(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
        },
        {
          id: '3-2',
          label: '2. How often do you have difficulty getting things in order when you have to do a task that requires organization?',
          type: 'multiple-choice',
          value: ASRS2,
          onChange: (e) => setASRS2(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
        },
        {
          id: '3-3',
          label: '3. How often do you have problems remembering appointments or obligations?',
          type: 'multiple-choice',
          value: ASRS3,
          onChange: (e) => setASRS3(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
        },
        {
          id: '3-4',
          label: '4. When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
          type: 'multiple-choice',
          value: ASRS4,
          onChange: (e) => setASRS4(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
        },
        {
          id: '3-5',
          label: '5. How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
          type: 'multiple-choice',
          value: ASRS5,
          onChange: (e) => setASRS5(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
        },
        {
          id: '3-6',
          label: '6. How often do you feel overly active and compelled to do things, like you were driven by a motor?',
          type: 'multiple-choice',
          value: ASRS6,
          onChange: (e) => setASRS6(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
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
            backgroundColor: '#d1f2ea',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          scrollbarWidth: 'thin', // Firefox
          scrollbarColor: '#d1f2ea transparent', // Firefox
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

export default Pre
