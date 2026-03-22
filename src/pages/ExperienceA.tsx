import { Box, Typography } from '@mui/material';
import experimentImage from '../assets/experiment.png';
import ColorButton from '../components/ColorButton';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import FormSpace from '../components/Form/FormSpace';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { stepsByGroup } from './experienceStepsA';
import type { Step } from './experienceStepsA';

function ExperienceA() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const participantCode = location.state?.participantCode;
  const groupNumber = location.state?.groupNumber;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const rawSteps: Step[] = groupNumber ? stepsByGroup[groupNumber] || [] : [];

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const steps: Step[] = rawSteps.map(step => ({
    ...step,
    question: step.question.map(q => {
      if (q.type === 'likert-group') {
        return {
          ...q,
          likertRows: q.likertRows?.map((row) => ({
            ...row,
            value: answers[row.id] || "",
          })),
          onMatrixChange: (rowId: string, value: string) => handleChange(rowId, value),
        };
      }

      return {
        ...q,
        value: answers[q.id] || "",
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(q.id, e.target.value)
      };
    })
  }));

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  if (!participantCode) {
    return <div>Invalid access. Please restart the experiment.</div>;
  }

  if (!groupNumber || !stepsByGroup[groupNumber]) {
    return <div>Invalid group configuration</div>;
  }

async function saveResponses() {
  const answerColumns = Object.fromEntries(
    Object.entries(answers).map(([key, value]) => [
      key.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
      value,
    ])
  );

  return supabase.from("responses").insert([
    {
      participant_code: participantCode,
      group_number: groupNumber,
      phase: "experiencea",
      ...answerColumns
    }
  ]);
}

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const { error } = await saveResponses();

      if (error) {
        if (error.code === "23505") {
          alert("This participant code has already completed this phase.");
        } else {
          alert("There was a problem saving your answers. Please contact the researcher.");
        }
        return;
      }

      navigate('/experienceb', { state: { participantCode, groupNumber } });
    }
  };

  const isNextDisabled = () => {
    const step = steps[currentStep];
    if (!step) return false;
    return step.question.some(
      (q) => {
        if (!q.required) return false;

        if (q.type === 'likert-group') {
          return q.likertRows?.some((row) => !row.value || row.value === '') ?? true;
        }

        return !q.value || q.value === '';
      }
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
          Reading Comprehension
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
        <Box
          ref={contentRef}
          sx={{
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

export default ExperienceA
