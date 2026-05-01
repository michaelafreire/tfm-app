import { Box } from '@mui/material';
import ColorButton from '../components/ColorButton';
import ExperimentHeader from '../components/ExperimentHeader';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import FormSpace from '../components/Form/FormSpace';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { computeAsrsProfile } from "../experiment/adaptiveConfig";
import type { ExperimentRouteState } from "../experiment/routeState";
import { readLocalDraft, readLocalSession, useLocalDraft, writeLocalSession } from "../hooks/useLocalDraft";

type Choice = string

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
      phase: "pre",
    });
  }, [groupNumber, participantCode]);
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

  const steps: Step[] = [
    {
      id: '1',
      label: 'Consent Form',
      description: `Please read the consent form carefully and provide your initials to indicate your agreement to participate in this experiment:

    # Consent Form

## AI Reading Comprehension Study (Web-Based)

Purpose

This study examines how people interact with AI systems during reading comprehension tasks.

What You Will Do

If you participate, you will:

* Complete short reading comprehension tasks with AI support
* Have your eye movements recorded using **WebGrazer**
* Complete a short self-report questionnaire (ASRS)

Eye Tracking (WebGrazer)

* A standard webcam is used during the study
* The webcam **does not record video or images**
* Only **screen gaze coordinates (x/y positions)** are collected

Questionnaire (ASRS)

* Measures **self-reported inattention**
* Used for research only
* **No diagnosis, labeling, or clinical classification** will be made

Data Use

* Responses, interaction logs, and gaze coordinates are collected
* Data is anonymized and used for research only
* No video or identifiable images are stored

Voluntary Participation

* Participation is voluntary
* You may stop at any time without penalty

Consent

By continuing, you confirm that you:

* Understand the study
* Agree to participate voluntarily
* Understand that webcam use only records gaze coordinates, not images or video
* Understand the ASRS is not a diagnostic tool
`,

      question: [
        {
          id: '1-1',
          label: 'Please provide your initials:',
          type: 'text',
          value: consent,
          onChange: (e) => setConsent(e.target.value),
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
          label: 'What degree are you <strong>currently pursuing</strong>?',
          type: 'multiple-choice',
          value: demograph_1,
          onChange: (e) => setDemograph1(e.target.value),
          choice: ["Bachelor's Degree", "Master's Degree", "PhD"],
          required: true,
        },
        {
          id: '2-2',
          label: 'When did you <strong>begin</strong> this program?',
          type: 'date',
          value: demograph_2,
          onDateChange: (value) => setDemograph2(value),
          required: true,
        },
        {
          id: '2-3',
          label: 'What is your <strong>nationality</strong>?',
          type: 'text',
          value: demograph_3,
          onChange: (e) => setDemograph3(e.target.value),
          required: true,
        },
        {
          id: '2-4',
          label: 'In which country is your <strong>current residence</strong>?',
          type: 'text',
          value: demograph_4,
          onChange: (e) => setDemograph4(e.target.value),
          required: true,
        }
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
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
          required: true,
        },
        {
          id: '3-2',
          label: '2. How often do you have difficulty getting things in order when you have to do a task that requires organization?',
          type: 'multiple-choice',
          value: ASRS2,
          onChange: (e) => setASRS2(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
          required: true,
        },
        {
          id: '3-3',
          label: '3. How often do you have problems remembering appointments or obligations?',
          type: 'multiple-choice',
          value: ASRS3,
          onChange: (e) => setASRS3(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
          required: true,
        },
        {
          id: '3-4',
          label: '4. When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
          type: 'multiple-choice',
          value: ASRS4,
          onChange: (e) => setASRS4(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
          required: true,
        },
        {
          id: '3-5',
          label: '5. How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
          type: 'multiple-choice',
          value: ASRS5,
          onChange: (e) => setASRS5(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
          required: true,
        },
        {
          id: '3-6',
          label: '6. How often do you feel overly active and compelled to do things, like you were driven by a motor?',
          type: 'multiple-choice',
          value: ASRS6,
          onChange: (e) => setASRS6(e.target.value),
          choice: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
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
          phase: "calibrationa",
        });

        navigate('/calibration', {
          state: {
            participantCode,
            groupNumber,
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
      <ExperimentHeader title="Pre-experiment Questions">
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
