import { Box } from '@mui/material';
import ColorButton from '../components/ColorButton';
import ExperimentHeader from '../components/ExperimentHeader';
import PartPill from '../components/PartPill';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import FormSpace from '../components/Form/FormSpace';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../supabaseClient";
import { readLocalDraft, useLocalDraft, writeLocalSession } from "../hooks/useLocalDraft";
import type { ExperimentRouteState } from "../experiment/routeState";

type Choice = string | { value: string; label: string };

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  choice?: Choice[];
  required?: boolean;
  multilineRows?: number;
  width?: string;
};

type Step = {
  id: string;
  label: string;
  description: string;
  question: Question[];
};

function Post() {
  const location = useLocation();
  const routeState = (location.state as ExperimentRouteState | null) ?? {};
  const { t } = useTranslation();
  const participantCode = routeState.participantCode;
  const groupNumber = routeState.groupNumber;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const draftKey = `tfm-draft:post:${participantCode ?? "unknown"}`;
  const savedDraft = useMemo(
    () => readLocalDraft(draftKey, {
      currentStep: 0,
      feedback: "",
      difference: "",
    }),
    [draftKey],
  );
  const [currentStep, setCurrentStep] = useState<number>(savedDraft.currentStep);
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(savedDraft.feedback);
  const [difference, setDifference] = useState(savedDraft.difference);
  const { clearDraft } = useLocalDraft(
    draftKey,
    {
      currentStep,
      feedback,
      difference,
    },
    Boolean(participantCode),
  );
  useEffect(() => {
    if (!participantCode || !groupNumber) return;
    writeLocalSession({
      participantCode,
      groupNumber,
      language: routeState.language,
      phase: "post",
    });
  }, [groupNumber, participantCode, routeState.language]);
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [currentStep]);

  if (!participantCode) {
    return <div>Invalid access. Please restart the experiment.</div>;
  }

  async function savePostResponses() {
    return supabase.from("responses").insert([
      {
        participant_code: participantCode,
        group_number: groupNumber,
        phase: "post",
        feedback: feedback,
        difference: difference,
        // Add other responses here
      }
    ]);
  }

  const steps: Step[] = [
    {
      id: '1',
      label: t("post.experience.label"),
      description: t("post.experience.description"),
      question: [
        {
          id: '1-1',
          label: t("post.experience.difference"),
          type: 'text',
          value: difference,
          onChange: (e) => setDifference(e.target.value),
          required: true,
          multilineRows: 3,
          width: "65%",
        },
        {
          id: '1-2',
          label: t("post.experience.feedback"),
          type: 'text',
          value: feedback,
          onChange: (e) => setFeedback(e.target.value),
          required: true,
          multilineRows: 3,
          width: "65%",
        },
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

      clearDraft();
      navigate('/final', { state: { participantCode, groupNumber, language: routeState.language } });
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
        flexDirection:  "column",
        height: "100%",
        gap: 1,
      }}>
      <ExperimentHeader title={t("instructions.postTitle")} action={<PartPill label={t("part.four")} />}>
        <ProgressBar steps={steps} currentStep={currentStep} />
      </ExperimentHeader>
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
        <Box ref={contentRef} sx={{
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
            name={t("common.next")}
            disabled={isNextDisabled()}
            onClick={handleNext}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Post
