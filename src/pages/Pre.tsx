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
import { computeAsrsProfile } from "../experiment/adaptiveConfig";
import type { ExperimentRouteState } from "../experiment/routeState";
import { readLocalDraft, readLocalSession, useLocalDraft, writeLocalSession } from "../hooks/useLocalDraft";

type Choice = string | { value: string; label: string };

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number' | 'date' ;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (value: string) => void;
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
  const routeState = (location.state as ExperimentRouteState | null) ?? {};
  const navigate = useNavigate();
  const { t } = useTranslation();
  const participantCode = routeState.participantCode;
  const groupNumber = routeState.groupNumber;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const draftKey = `tfm-draft:pre:${participantCode ?? "unknown"}`;
  const savedDraft = useMemo(
    () => readLocalDraft(draftKey, {
      currentStep: 0,
      consent: "",
      demograph_1: "",
      demograph_2: "",
      demograph_3: "",
      demograph_4: "",
      ASRS1: "",
      ASRS2: "",
      ASRS3: "",
      ASRS4: "",
      ASRS5: "",
      ASRS6: "",
    }),
    [draftKey],
  );
  const [currentStep, setCurrentStep] = useState<number>(savedDraft.currentStep);
  const [consent, setConsent] = useState(savedDraft.consent);
  const [demograph_1, setDemograph1] = useState(savedDraft.demograph_1);
  const [demograph_2, setDemograph2] = useState(savedDraft.demograph_2);
  const [demograph_3, setDemograph3] = useState(savedDraft.demograph_3);
  const [demograph_4, setDemograph4] = useState(savedDraft.demograph_4);
  const [ASRS1, setASRS1] = useState(savedDraft.ASRS1);
  const [ASRS2, setASRS2] = useState(savedDraft.ASRS2);
  const [ASRS3, setASRS3] = useState(savedDraft.ASRS3);
  const [ASRS4, setASRS4] = useState(savedDraft.ASRS4);
  const [ASRS5, setASRS5] = useState(savedDraft.ASRS5);
  const [ASRS6, setASRS6] = useState(savedDraft.ASRS6);
  const { clearDraft } = useLocalDraft(
    draftKey,
    {
      currentStep,
      consent,
      demograph_1,
      demograph_2,
      demograph_3,
      demograph_4,
      ASRS1,
      ASRS2,
      ASRS3,
      ASRS4,
      ASRS5,
      ASRS6,
    },
    Boolean(participantCode),
  );
  useEffect(() => {
    if (!participantCode || !groupNumber) return;
    writeLocalSession({
      participantCode,
      groupNumber,
      language: routeState.language,
      phase: "pre",
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

  async function savePreResponses() {
    return supabase.from("responses").insert([
      {
        participant_code: participantCode,
        group_number: groupNumber,
        phase: "pre",
        consent: consent,
        demograph_1: demograph_1,
        demograph_2: demograph_2,
        demograph_3: demograph_3,
        demograph_4: demograph_4,
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

  const degreeChoices: Choice[] = [
    { value: "Bachelor's Degree", label: t("pre.degree.bachelor") },
    { value: "Master's Degree", label: t("pre.degree.master") },
    { value: "PhD", label: t("pre.degree.phd") },
  ];
  const asrsChoices: Choice[] = [
    { value: "Never", label: t("pre.asrsChoices.never") },
    { value: "Rarely", label: t("pre.asrsChoices.rarely") },
    { value: "Sometimes", label: t("pre.asrsChoices.sometimes") },
    { value: "Often", label: t("pre.asrsChoices.often") },
    { value: "Very Often", label: t("pre.asrsChoices.veryOften") },
  ];

  const steps: Step[] = [
    {
      id: '1',
      label: t("pre.consent.label"),
      description: t("pre.consent.description"),

      question: [
        {
          id: '1-1',
          label: t("pre.consent.initials"),
          type: 'text',
          value: consent,
          onChange: (e) => setConsent(e.target.value),
          required: true,
        },
      ]
    },
    {
      id: '2',
      label: t("pre.about.label"),
      description: t("pre.about.description"),
      question: [
        {
          id: '2-1',
          label: t("pre.about.degree"),
          type: 'multiple-choice',
          value: demograph_1,
          onChange: (e) => setDemograph1(e.target.value),
          choice: degreeChoices,
          required: true,
        },
        {
          id: '2-2',
          label: t("pre.about.birthDate"),
          type: 'date',
          value: demograph_2,
          onDateChange: (value) => setDemograph2(value),
          required: true,
        },
        {
          id: '2-3',
          label: t("pre.about.nationality"),
          type: 'text',
          value: demograph_3,
          onChange: (e) => setDemograph3(e.target.value),
          required: true,
        },
        {
          id: '2-4',
          label: t("pre.about.residence"),
          type: 'text',
          value: demograph_4,
          onChange: (e) => setDemograph4(e.target.value),
          required: true,
        }
      ]
    },
    {
      id: '3',
      label: t("pre.asrs.label"),
      description: t("pre.asrs.description"),
      question: [
        {
          id: '3-1',
          label: t("pre.asrs.q1"),
          type: 'multiple-choice',
          value: ASRS1,
          onChange: (e) => setASRS1(e.target.value),
          choice: asrsChoices,
          required: true,
        },
        {
          id: '3-2',
          label: t("pre.asrs.q2"),
          type: 'multiple-choice',
          value: ASRS2,
          onChange: (e) => setASRS2(e.target.value),
          choice: asrsChoices,
          required: true,
        },
        {
          id: '3-3',
          label: t("pre.asrs.q3"),
          type: 'multiple-choice',
          value: ASRS3,
          onChange: (e) => setASRS3(e.target.value),
          choice: asrsChoices,
          required: true,
        },
        {
          id: '3-4',
          label: t("pre.asrs.q4"),
          type: 'multiple-choice',
          value: ASRS4,
          onChange: (e) => setASRS4(e.target.value),
          choice: asrsChoices,
          required: true,
        },
        {
          id: '3-5',
          label: t("pre.asrs.q5"),
          type: 'multiple-choice',
          value: ASRS5,
          onChange: (e) => setASRS5(e.target.value),
          choice: asrsChoices,
          required: true,
        },
        {
          id: '3-6',
          label: t("pre.asrs.q6"),
          type: 'multiple-choice',
          value: ASRS6,
          onChange: (e) => setASRS6(e.target.value),
          choice: asrsChoices,
          required: true,
        },
      ]
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const asrsProfile = computeAsrsProfile([ASRS1, ASRS2, ASRS3, ASRS4, ASRS5, ASRS6]);
      const goToCalibrationA = () => {
        clearDraft();
        writeLocalSession({
          participantCode,
          groupNumber: Number(groupNumber),
          language: routeState.language,
          phase: "calibrationa",
        });

        navigate('/experience-intro', {
          state: {
            participantCode,
            groupNumber,
            language: routeState.language,
            introExperience: "A",
            nextPath: "/experiencea",
            ...asrsProfile,
          },
        });
      };

      const { error } = await savePreResponses();

      if (error) {
        if (error.code === "23505") {
          const localSession = readLocalSession();
          if (
            localSession?.participantCode === participantCode &&
            localSession.groupNumber === Number(groupNumber)
          ) {
            goToCalibrationA();
            return;
          }

          alert("This participant code has already completed this phase.");
        } else {
          alert("There was a problem saving your answers. Please contact the researcher.");
        }
        return;
      }

      goToCalibrationA();
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
        flexDirection: "column",
        height: "100%",
        gap: 1,
      }}>
      <ExperimentHeader title={t("instructions.preTitle")} action={<PartPill label={t("part.one")} />}>
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

export default Pre
