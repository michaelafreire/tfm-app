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
import {
  startTracking,
  pauseTracking,
  resumeTracking,
  setActiveSectionId,
  stopTracking,
  getGazeData
} from "../webgazer/webgazerManager";

type ReadingTiming = {
  startedAt: number;
  endedAt?: number;
};

function ExperienceA() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const participantCode = location.state?.participantCode;
  const groupNumber = location.state?.groupNumber;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completedReadingSteps, setCompletedReadingSteps] = useState<Record<string, boolean>>({});
  const readingTimingsRef = useRef<Record<string, ReadingTiming>>({});
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

  useEffect(() => {
    startTracking();

    return () => {
      stopTracking();
      setActiveSectionId(null);
    };
  }, []);

  useEffect(() => {
    const step = steps[currentStep];
    if (!step) {
      pauseTracking();
      setActiveSectionId(null);
      return;
    }

    // Never record gaze during non-reading steps.
    if (step.id === "1" || step.id === "5") {
      pauseTracking();
      setActiveSectionId(null);
      return;
    }

    const firstQuestionId = step.question[0]?.id ?? "";
    const isReadingSection = /_R\d+_/.test(firstQuestionId);
    const hasCompletedReading = completedReadingSteps[step.id] === true;

    if (isReadingSection && !hasCompletedReading) {
      setActiveSectionId(step.id);
      resumeTracking();
      return;
    }

    pauseTracking();
    setActiveSectionId(null);
  }, [completedReadingSteps, currentStep, steps]);

  const handleCompleteReading = (stepId: string) => {
    const now = Date.now();
    const existing = readingTimingsRef.current[stepId];
    readingTimingsRef.current[stepId] = {
      startedAt: existing?.startedAt ?? now,
      endedAt: now,
    };

    setCompletedReadingSteps(prev => ({
      ...prev,
      [stepId]: true,
    }));

    // When questions are revealed, always start from the top of the panel.
    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    });

    pauseTracking();
    setActiveSectionId(null);
  };

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
      const nextStepIndex = currentStep + 1;
      const nextStep = steps[nextStepIndex];

      if (nextStep) {
        const nextFirstQuestionId = nextStep.question[0]?.id ?? "";
        const isNextReadingSection = /_R\d+_/.test(nextFirstQuestionId);

        if (isNextReadingSection && !readingTimingsRef.current[nextStep.id]?.startedAt) {
          readingTimingsRef.current[nextStep.id] = {
            startedAt: Date.now(),
          };
        }
      }

      setCurrentStep(nextStepIndex);
    } else {
      stopTracking();
      const rawData = getGazeData();

      const { error } = await saveResponses();
      // compute attention vs distraction

      if (error) {
        if (error.code === "23505") {
          alert("This participant code has already completed this phase.");
        } else {
          alert("There was a problem saving your answers. Please contact the researcher.");
        }
        return;
      }

      // Calculate global gaze features
      const readingStepIds = ["2", "3", "4"];

      const perReadingRows = readingStepIds.map((stepId) => {
        const stepData = rawData.filter((point) => point.sectionId === stepId);
        const sample_count = stepData.length;

        const uniqueCoordinates = new Set<string>();
        stepData.forEach((point) => {
          uniqueCoordinates.add(`${Math.round(point.x)},${Math.round(point.y)}`);
        });
        const unique_sample_count = uniqueCoordinates.size;

        let dispersion = 0;
        if (sample_count > 0) {
          const meanX = stepData.reduce((sum, p) => sum + Math.round(p.x), 0) / sample_count;
          const meanY = stepData.reduce((sum, p) => sum + Math.round(p.y), 0) / sample_count;

          const sumSquaredDistances = stepData.reduce((sum, p) => {
            const dx = Math.round(p.x) - meanX;
            const dy = Math.round(p.y) - meanY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return sum + (distance * distance);
          }, 0);

          dispersion = Math.sqrt(sumSquaredDistances / sample_count);
        }

        const timing = readingTimingsRef.current[stepId];
        const started_at = timing?.startedAt ? new Date(timing.startedAt).toISOString() : null;
        const ended_at = timing?.endedAt ? new Date(timing.endedAt).toISOString() : null;
        const reading_duration_ms =
          timing?.startedAt && timing?.endedAt ? timing.endedAt - timing.startedAt : null;

        return {
          participant_code: participantCode,
          group_number: groupNumber,
          task: "A",
          reading_step: stepId,
          started_at,
          ended_at,
          reading_duration_ms,
          sample_count,
          unique_sample_count,
          dispersion,
        };
      });

      const { error: eyeTrackingError } = await supabase
        .from("eye_tracking")
        .insert(perReadingRows);

      if (eyeTrackingError) {
        console.error("Failed to insert eye_tracking rows (Experience A)", {
          error: eyeTrackingError,
          participantCode,
          groupNumber,
          rowCount: perReadingRows.length,
          rows: perReadingRows,
        });

        alert("Eye-tracking data could not be saved. Check the browser console for debug details.");
        return;
      }

      navigate('/calibration', {
        state: {
          participantCode,
          groupNumber,
          nextPath: "/experienceb",
        },
      });
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
        alignItems: "stretch",
      }}>
        <Box
          ref={contentRef}
          sx={{
            width: '100%',
            flex: 4,
            overflowY: 'auto',
            overflowX: 'hidden',
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
          <FormSpace
            steps={steps}
            currentStep={currentStep}
            completedReadingSteps={completedReadingSteps}
            onCompleteReadingStep={handleCompleteReading}
          />
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
