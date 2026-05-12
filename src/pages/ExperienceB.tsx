import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import experimentImage from '../assets/experiment.png';
import AdaptivePaceSlider from '../components/Adaptive/AdaptivePaceSlider';
import AdaptiveProgressBar from '../components/Adaptive/AdaptiveProgressBar';
import AdaptiveThemePicker from '../components/Adaptive/AdaptiveThemePicker';
import AttentionProbeModal from '../components/Adaptive/AttentionProbeModal';
import CoachBubble from '../components/Adaptive/CoachBubble';
import ColorButton from '../components/ColorButton';
import FormSpace from '../components/Form/FormSpace';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import PartPill from '../components/PartPill';
import {
  adaptiveThemes,
  getAdaptiveTheme,
  getExperienceCondition,
  type AdaptiveThemeId,
} from '../experiment/adaptiveConfig';
import type { ExperimentRouteState } from '../experiment/routeState';
import { stepsByGroup } from './experienceStepsB';
import type { Step } from './experienceStepsB';
import { translateExperienceSteps } from './experienceTranslations';
import { supabase } from "../supabaseClient";
import { getCoachBubbleMessage } from "../services/coachBubble";
import { getRandomProbeDelayMs } from "../experiment/probeTiming";
import { readLocalDraft, useLocalDraft, writeLocalSession } from "../hooks/useLocalDraft";
import {
  startTracking,
  pauseTracking,
  resumeTracking,
  setActiveSectionId,
  setAoiRects,
  stopTracking,
  getMissingSampleCount,
  getGazeData
} from "../webgazer/webgazerManager";

type ReadingTiming = {
  startedAt: number;
  endedAt?: number;
};

type ProbeResponse = "task-focused" | "distracted by thoughts" | "other";
type CoachBubbleState = {
  message: string;
  stepId: string;
} | null;
const GAZE_SAMPLE_INTERVAL_MS = 100;
const gazeStorageKey = (participantCode: string, task: "A" | "B") => `tfm-gaze:${task}:${participantCode}`;

function readStoredGazeData(participantCode: string, task: "A" | "B") {
  try {
    const rawStoredData = window.localStorage.getItem(gazeStorageKey(participantCode, task));
    return rawStoredData ? JSON.parse(rawStoredData) : [];
  } catch {
    return [];
  }
}

function getAoiSummary(stepId: string, stepData: ReturnType<typeof getGazeData>) {
  const missingSamples = getMissingSampleCount(stepId);
  const totalExpectedSamples = stepData.length || 1;
  const progressSamples = stepData.filter((point) => point.aoi === "progress").length;
  const readingSamples = stepData.filter((point) => point.aoi === "reading").length;
  const screenTutSamples = stepData.filter((point) => point.aoi === "screen_tut").length;
  const outsideSamples = stepData.filter((point) => point.aoi === "outside").length;
  const screenTutDurationMs = screenTutSamples * GAZE_SAMPLE_INTERVAL_MS;
  const outsideDurationMs = outsideSamples * GAZE_SAMPLE_INTERVAL_MS;
  const missingPredictionDurationMs = missingSamples * GAZE_SAMPLE_INTERVAL_MS;

  return {
    progress_aoi_duration_ms: progressSamples * GAZE_SAMPLE_INTERVAL_MS,
    reading_aoi_duration_ms: readingSamples * GAZE_SAMPLE_INTERVAL_MS,
    screen_tut_aoi_duration_ms: screenTutDurationMs,
    outside_aoi_duration_ms: outsideDurationMs,
    missing_prediction_duration_ms: missingPredictionDurationMs,
    off_reading_duration_ms: screenTutDurationMs + outsideDurationMs + missingPredictionDurationMs,
    progress_aoi_percent: Math.round((progressSamples / totalExpectedSamples) * 100),
    reading_aoi_percent: Math.round((readingSamples / totalExpectedSamples) * 100),
    screen_tut_aoi_percent: Math.round((screenTutSamples / totalExpectedSamples) * 100),
    outside_aoi_percent: Math.round((outsideSamples / totalExpectedSamples) * 100),
    missing_prediction_percent: Math.round((missingSamples / totalExpectedSamples) * 100),
    off_reading_percent: Math.round(((screenTutSamples + outsideSamples + missingSamples) / totalExpectedSamples) * 100),
  };
}

function isReadingStep(step?: Step) {
  const firstQuestionId = step?.question[0]?.id ?? "";
  return /_R\d+_/.test(firstQuestionId);
}

function ExperienceB() {
  const location = useLocation();
  const routeState = (location.state as ExperimentRouteState | null) ?? {};
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const participantCode = routeState.participantCode;
  const groupNumber = routeState.groupNumber;
  const condition = groupNumber ? getExperienceCondition(groupNumber, "B") : "nonAdaptive";
  const isAdaptive = condition === "adaptive";
  const draftKey = `tfm-draft:experienceb:${participantCode ?? "unknown"}`;
  const savedDraft = useMemo(
    () => readLocalDraft(draftKey, {
      currentStep: 0,
      selectedTheme: isAdaptive ? routeState.selectedTheme : undefined,
      answers: {} as Record<string, string>,
      completedReadingSteps: {} as Record<string, boolean>,
      readingProgressByStep: {} as Record<string, number>,
      paceWarmthByStep: {} as Record<string, number>,
      readingPacePreference: 0,
    }),
    [draftKey, isAdaptive, routeState.selectedTheme],
  );
  const [currentStep, setCurrentStep] = useState<number>(savedDraft.currentStep);
  const [selectedTheme, setSelectedTheme] = useState<AdaptiveThemeId | undefined>(
    savedDraft.selectedTheme
  );
  const theme = getAdaptiveTheme(selectedTheme);
  const ticksPerReading = routeState.ticksPerReading ?? 2;
  const [coachBubble, setCoachBubble] = useState<CoachBubbleState>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(savedDraft.answers);
  const [completedReadingSteps, setCompletedReadingSteps] = useState<Record<string, boolean>>(savedDraft.completedReadingSteps);
  const [readingProgressByStep, setReadingProgressByStep] = useState<Record<string, number>>(savedDraft.readingProgressByStep);
  const [paceWarmthByStep, setPaceWarmthByStep] = useState<Record<string, number>>(savedDraft.paceWarmthByStep);
  const [readingPacePreference, setReadingPacePreference] = useState(savedDraft.readingPacePreference);
  const [shiningTick, setShiningTick] = useState<{ stepId: string; tickIndex: number } | null>(null);
  const [probeOpen, setProbeOpen] = useState(false);
  const [activeProbeStepId, setActiveProbeStepId] = useState<string | null>(null);
  const readingTimingsRef = useRef<Record<string, ReadingTiming>>({});
  const progressAreaRef = useRef<HTMLDivElement | null>(null);
  const readingAreaRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const stallTimerRef = useRef<number | null>(null);
  const probeTimerRef = useRef<number | null>(null);
  const probeTimerStepIdRef = useRef<string | null>(null);
  const probeShownAtRef = useRef<number | null>(null);
  const paceIntervalRef = useRef<number | null>(null);
  const lastScrollAtRef = useRef<Record<string, number>>({});
  const probeWarmthActiveRef = useRef<Record<string, boolean>>({});
  const stallMessageShownRef = useRef<Record<string, boolean>>({});
  const progressMilestonesRef = useRef<Record<string, number>>({});
  const scheduledProbeStepIdsRef = useRef<Record<string, boolean>>({});
  const welcomeBubbleShownRef = useRef<string | null>(null);
  const shineTimerRef = useRef<number | null>(null);
  const probeRecordsRef = useRef<Array<{
    stepId: string;
    scheduledAt: number;
    shownAt: number;
    answeredAt: number;
    response: ProbeResponse;
  }>>([]);
  const rawSteps: Step[] = useMemo(
    () => (groupNumber ? stepsByGroup[groupNumber] || [] : []),
    [groupNumber]
  );
  const localizedRawSteps: Step[] = useMemo(
    () => translateExperienceSteps(rawSteps, routeState.language ?? i18n.language, 2),
    [i18n.language, rawSteps, routeState.language]
  );
  const { clearDraft } = useLocalDraft(
    draftKey,
    {
      currentStep,
      selectedTheme,
      answers,
      completedReadingSteps,
      readingProgressByStep,
      paceWarmthByStep,
      readingPacePreference,
    },
    Boolean(participantCode),
  );
  useEffect(() => {
    if (!participantCode || !groupNumber) return;
    writeLocalSession({
      participantCode,
      groupNumber,
      language: routeState.language,
      phase: "experienceb",
    });
  }, [groupNumber, participantCode, routeState.language]);

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const showCoachBubble = useCallback(async (
    event: "welcome" | "steady_progress" | "checkpoint_reached" | "stall_detected" | "probe_off_task",
    step: { id: string; label: string }
  ) => {
    if (!isAdaptive || !selectedTheme) return;

    const message = await getCoachBubbleMessage({
      event,
      themeId: selectedTheme,
      readingLabel: step.label,
    });

    setCoachBubble({
      message,
      stepId: step.id,
    });
  }, [isAdaptive, selectedTheme]);

  const stallDelayMs =
    readingPacePreference <= -2
      ? 48000
      : readingPacePreference === -1
        ? 22000
        : readingPacePreference === 1
          ? 10000
          : readingPacePreference >= 2
            ? 7000
            : 15000;
  const paceWarmupDelayMs =
    readingPacePreference <= -2
      ? 30000
      : readingPacePreference === -1
        ? 15000
        : readingPacePreference === 1
          ? 3000
          : readingPacePreference >= 2
            ? 500
            : 10000;

  const resetStallTimer = useCallback((step: Step) => {
    if (!isAdaptive || !isReadingStep(step) || completedReadingSteps[step.id]) return;

    if (stallTimerRef.current) {
      window.clearTimeout(stallTimerRef.current);
    }

    stallTimerRef.current = window.setTimeout(() => {
      if (!stallMessageShownRef.current[step.id]) {
        stallMessageShownRef.current[step.id] = true;
        setPaceWarmthByStep((prev) => ({
          ...prev,
          [step.id]: 1,
        }));
        void showCoachBubble("stall_detected", step);
      }
    }, stallDelayMs);
  }, [completedReadingSteps, isAdaptive, showCoachBubble, stallDelayMs]);

  const steps: Step[] = useMemo(() => (
    localizedRawSteps.map(step => ({
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
    }))
  ), [answers, localizedRawSteps]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [currentStep]);

  useEffect(() => {
    startTracking();

    return () => {
      stopTracking();
      setActiveSectionId(null);
      if (stallTimerRef.current) window.clearTimeout(stallTimerRef.current);
      if (probeTimerRef.current) window.clearTimeout(probeTimerRef.current);
      if (shineTimerRef.current) window.clearTimeout(shineTimerRef.current);
      if (paceIntervalRef.current) window.clearInterval(paceIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const updateAoiRects = () => {
      const nextRects = [];
      const progressRect = progressAreaRef.current?.getBoundingClientRect();
      const readingRect = readingAreaRef.current?.getBoundingClientRect();

      if (progressRect) {
        nextRects.push({ id: "progress" as const, rect: progressRect });
      }
      if (readingRect) {
        nextRects.push({ id: "reading" as const, rect: readingRect });
      }

      setAoiRects(nextRects);
    };

    updateAoiRects();

    const resizeObserver = new ResizeObserver(updateAoiRects);
    if (progressAreaRef.current) resizeObserver.observe(progressAreaRef.current);
    if (readingAreaRef.current) resizeObserver.observe(readingAreaRef.current);
    window.addEventListener("resize", updateAoiRects);
    window.addEventListener("scroll", updateAoiRects, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateAoiRects);
      window.removeEventListener("scroll", updateAoiRects, true);
      setAoiRects([]);
    };
  }, [currentStep, isAdaptive, selectedTheme]);

  useEffect(() => {
    const step = steps[currentStep];
    if (!step) {
      pauseTracking();
      setActiveSectionId(null);
      return;
    }

    if (step.id === "1" || step.id === "5") {
      pauseTracking();
      setActiveSectionId(null);
      return;
    }

    const hasCompletedReading = completedReadingSteps[step.id] === true;

    if (isReadingStep(step) && !hasCompletedReading) {
      setActiveSectionId(step.id);
      resumeTracking();
      return;
    }

    pauseTracking();
    setActiveSectionId(null);
  }, [completedReadingSteps, currentStep, steps]);

  const currentStepData = steps[currentStep];
  const currentStepId = currentStepData?.id;
  const currentStepIsReading = isReadingStep(currentStepData);
  const currentStepCompleted = currentStepId ? completedReadingSteps[currentStepId] === true : false;

  useEffect(() => {
    const step = steps[currentStep];
    const scheduledProbeStepIds = scheduledProbeStepIdsRef.current;
    if (stallTimerRef.current) {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }

    if (!step || !currentStepIsReading || currentStepCompleted) {
      return;
    }
    lastScrollAtRef.current[step.id] = lastScrollAtRef.current[step.id] ?? Date.now();
    probeWarmthActiveRef.current[step.id] = probeWarmthActiveRef.current[step.id] ?? false;
    stallMessageShownRef.current[step.id] = stallMessageShownRef.current[step.id] ?? false;

    resetStallTimer(step);

    if (paceIntervalRef.current) {
      window.clearInterval(paceIntervalRef.current);
    }
    paceIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (lastScrollAtRef.current[step.id] ?? Date.now());
      const gradualWarmth = Math.max(
        0,
        Math.min(1, (elapsed - paceWarmupDelayMs) / Math.max(stallDelayMs - paceWarmupDelayMs, 1))
      );
      const probeWarmth = probeWarmthActiveRef.current[step.id] ? 0.78 : 0;
      const nextWarmth = Math.max(gradualWarmth, probeWarmth);

      setPaceWarmthByStep((prev) => {
        const currentWarmth = prev[step.id] ?? 0;
        if (Math.abs(currentWarmth - nextWarmth) < 0.04) {
          return prev;
        }

        return {
          ...prev,
          [step.id]: nextWarmth,
        };
      });
    }, 300);

    if (scheduledProbeStepIdsRef.current[step.id]) {
      return;
    }

    const delay = getRandomProbeDelayMs();
    const scheduledAt = Date.now() + delay;
    scheduledProbeStepIds[step.id] = true;
    probeTimerStepIdRef.current = step.id;
    probeTimerRef.current = window.setTimeout(() => {
      probeShownAtRef.current = Date.now();
      setActiveProbeStepId(step.id);
      setProbeOpen(true);
      probeTimerRef.current = null;
      probeTimerStepIdRef.current = null;
    }, delay);

    probeRecordsRef.current = probeRecordsRef.current.filter((record) => record.stepId !== step.id);
    probeRecordsRef.current.push({
      stepId: step.id,
      scheduledAt,
      shownAt: 0,
      answeredAt: 0,
      response: "task-focused",
    });

    return () => {
      if (probeTimerRef.current && probeTimerStepIdRef.current === step.id) {
        window.clearTimeout(probeTimerRef.current);
        probeTimerRef.current = null;
        probeTimerStepIdRef.current = null;
        scheduledProbeStepIds[step.id] = false;
      }
      if (paceIntervalRef.current) {
        window.clearInterval(paceIntervalRef.current);
        paceIntervalRef.current = null;
      }
    };
  }, [currentStep, currentStepCompleted, currentStepId, currentStepIsReading, paceWarmupDelayMs, resetStallTimer, stallDelayMs, steps]);

  useEffect(() => {
    const container = contentRef.current;
    const step = steps[currentStep];

    if (!container || !step || !currentStepIsReading || currentStepCompleted) {
      return;
    }

    const handleScroll = () => {
      lastScrollAtRef.current[step.id] = Date.now();
      probeWarmthActiveRef.current[step.id] = false;
      stallMessageShownRef.current[step.id] = false;
      setPaceWarmthByStep((prev) => {
        if ((prev[step.id] ?? 0) === 0) {
          return prev;
        }

        return {
          ...prev,
          [step.id]: 0,
        };
      });

      const maxScroll = container.scrollHeight - container.clientHeight;
      const nextProgress = maxScroll <= 0
        ? 100
        : Math.max(0, Math.min(100, Math.round((container.scrollTop / maxScroll) * 100)));

      setReadingProgressByStep((prev) => {
        if (prev[step.id] === nextProgress) return prev;
        return {
          ...prev,
          [step.id]: nextProgress,
        };
      });

      resetStallTimer(step);

      if (isAdaptive && selectedTheme) {
        const milestoneSize = 100 / ticksPerReading;
        const milestone = Math.floor(nextProgress / milestoneSize);
        const previousMilestone = progressMilestonesRef.current[step.id] ?? 0;

        if (milestone > previousMilestone && milestone > 0 && milestone < ticksPerReading) {
          progressMilestonesRef.current[step.id] = milestone;
          setShiningTick({
            stepId: step.id,
            tickIndex: milestone - 1,
          });
          if (shineTimerRef.current) {
            window.clearTimeout(shineTimerRef.current);
          }
          shineTimerRef.current = window.setTimeout(() => {
            setShiningTick((current) =>
              current?.stepId === step.id && current.tickIndex === milestone - 1 ? null : current
            );
          }, 700);
          void showCoachBubble("steady_progress", step);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [currentStep, currentStepCompleted, currentStepId, currentStepIsReading, isAdaptive, resetStallTimer, selectedTheme, showCoachBubble, steps, ticksPerReading]);

  useEffect(() => {
    if (isAdaptive && currentStep === 0 && selectedTheme) {
      const firstStep = steps[0];
      const welcomeKey = `${selectedTheme}:${firstStep?.id ?? "intro"}`;
      if (firstStep && welcomeBubbleShownRef.current !== welcomeKey) {
        welcomeBubbleShownRef.current = welcomeKey;
        const timerId = window.setTimeout(() => {
          void showCoachBubble("welcome", firstStep);
        }, 0);

        return () => {
          window.clearTimeout(timerId);
        };
      }
    }
  }, [currentStep, isAdaptive, selectedTheme, showCoachBubble, steps]);

  const handleProbeResponse = (response: ProbeResponse) => {
    const step = steps[currentStep];
    const shownAt = probeShownAtRef.current ?? Date.now();
    const answeredAt = Date.now();

    setProbeOpen(false);
    setActiveProbeStepId(null);

    if (step) {
      const existingRecord = probeRecordsRef.current.find((record) => record.stepId === step.id);
      if (existingRecord) {
        existingRecord.shownAt = shownAt;
        existingRecord.answeredAt = answeredAt;
        existingRecord.response = response;
      }

      if (response !== "task-focused" && isAdaptive) {
        probeWarmthActiveRef.current[step.id] = true;
        setPaceWarmthByStep((prev) => ({
          ...prev,
          [step.id]: Math.max(prev[step.id] ?? 0, 0.78),
        }));
        void showCoachBubble("probe_off_task", step);
      }
    }
  };

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
    setReadingProgressByStep(prev => ({
      ...prev,
      [stepId]: 100,
    }));
    setPaceWarmthByStep((prev) => ({
      ...prev,
      [stepId]: 0,
    }));

    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    });

    const completedStep = steps.find((step) => step.id === stepId);
    if (completedStep && isAdaptive) {
      void showCoachBubble("checkpoint_reached", completedStep);
    }

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

    const probeAnswerByStepId = Object.fromEntries(
      probeRecordsRef.current.map((record) => [record.stepId, record.response])
    ) as Record<string, ProbeResponse | undefined>;
    const probeResponseTimeByStepId = Object.fromEntries(
      probeRecordsRef.current.map((record) => [
        record.stepId,
        record.shownAt && record.answeredAt ? record.answeredAt - record.shownAt : null,
      ])
    ) as Record<string, number | null>;

    return supabase.from("responses").insert([
      {
        participant_code: participantCode,
        group_number: groupNumber,
        phase: "experienceb",
        e2_r1_p: probeAnswerByStepId["2"] ?? null,
        e2_r2_p: probeAnswerByStepId["3"] ?? null,
        e2_r3_p: probeAnswerByStepId["4"] ?? null,
        e2_r1_p_time: probeResponseTimeByStepId["2"] ?? null,
        e2_r2_p_time: probeResponseTimeByStepId["3"] ?? null,
        e2_r3_p_time: probeResponseTimeByStepId["4"] ?? null,
        ...answerColumns
      }
    ]);
  }

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      const nextStep = steps[nextStepIndex];

      if (nextStep) {
        if (isReadingStep(nextStep) && !readingTimingsRef.current[nextStep.id]?.startedAt) {
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

      if (error) {
        if (error.code === "23505") {
          alert("This participant code has already completed this phase.");
        } else {
          alert("There was a problem saving your answers. Please contact the researcher.");
        }
        return;
      }

      const readingStepIds = ["2", "3", "4"];

      const perReadingRows = readingStepIds.map((stepId) => {
        const stepData = rawData.filter((point) => point.sectionId === stepId);
        const usableStepData = stepData.filter((point) => point.aoi !== "missing_prediction");
        const sample_count = usableStepData.length;
        const aoiSummary = getAoiSummary(stepId, stepData);

        const uniqueCoordinates = new Set<string>();
        usableStepData.forEach((point) => {
          uniqueCoordinates.add(`${Math.round(point.x)},${Math.round(point.y)}`);
        });
        const unique_sample_count = uniqueCoordinates.size;

        let dispersion = 0;
        if (sample_count > 0) {
          const meanX = usableStepData.reduce((sum, p) => sum + Math.round(p.x), 0) / sample_count;
          const meanY = usableStepData.reduce((sum, p) => sum + Math.round(p.y), 0) / sample_count;

          const sumSquaredDistances = usableStepData.reduce((sum, p) => {
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
          task: "B",
          reading_step: stepId,
          started_at,
          ended_at,
          reading_duration_ms,
          sample_count,
          unique_sample_count,
          dispersion,
          ...aoiSummary,
        };
      });

      const { error: eyeTrackingError } = await supabase
        .from("eye_tracking")
        .insert(perReadingRows);

      if (eyeTrackingError) {
        console.error("Failed to insert eye_tracking rows (Experience B)", {
          error: eyeTrackingError,
          participantCode,
          groupNumber,
          rowCount: perReadingRows.length,
          rows: perReadingRows,
        });

        alert("Eye-tracking data could not be saved. Check the browser console for debug details.");
        return;
      }

      const escapeCsv = (value: string | number) => {
        if (typeof value === "number" && Number.isNaN(value)) return "";
        const str = String(value ?? "");
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const experienceAGazeData = readStoredGazeData(participantCode, "A");
      const csvData = [...experienceAGazeData, ...rawData];

      const csvRows = [
        "task,raw_x,raw_y,x,y,t,route,section_id,aoi",
        ...csvData.map((point) => (
          [
            escapeCsv(point.route === "/experiencea" ? "A" : point.route === "/experienceb" ? "B" : ""),
            escapeCsv(point.rawX ?? ""),
            escapeCsv(point.rawY ?? ""),
            escapeCsv(point.x),
            escapeCsv(point.y),
            escapeCsv(point.t),
            escapeCsv(point.route),
            escapeCsv(point.sectionId ?? ""),
            escapeCsv(point.aoi ?? ""),
          ].join(",")
        )),
      ];

      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;"
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${participantCode}.csv`;
      a.click();
      window.localStorage.removeItem(gazeStorageKey(participantCode, "A"));

      clearDraft();
      writeLocalSession({
        participantCode,
        groupNumber,
        language: routeState.language,
        phase: "post",
      });

      navigate('/post', { state: { participantCode, groupNumber, language: routeState.language } });
    }
  };

  const isNextDisabled = () => {
    const step = steps[currentStep];
    if (!step) return false;

    if (isAdaptive && currentStep === 0 && !selectedTheme) {
      return true;
    }

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
        flexDirection: "column",
        height: "100%",
        gap: 1,
      }}>
      <Box ref={progressAreaRef} sx={{
        bgcolor: "secondary.main",
        borderRadius: 3,
        p: 3,
        flex: 1,
        height: { xs: "auto", md: "100%" },
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        position: "relative",
      }}>
        <Box sx={{ position: "absolute", top: 24, right: 24 }}>
          <PartPill label={t("part.three")} />
        </Box>
        <img src={experimentImage} alt="App Logo" style={{ width: 35, height: "auto" }} />
        <Box
          sx={{
            marginTop: 2,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold', pt: 1 }}>
            {t("experienceIntro.titleB")}
          </Typography>
          {isAdaptive && selectedTheme ? (
            <Box sx={{ width: "100%", maxWidth: 420, ml: "auto" }}>
              <CoachBubble
                message={coachBubble?.message ?? "Choose your pace. I'll keep an eye on the rhythm with you."}
                theme={theme}
              />
            </Box>
          ) : null}
        </Box>
        {isAdaptive ? (
          <>
            <AdaptiveProgressBar
              steps={steps.map(({ id, label }) => ({ id, label }))}
              currentStep={currentStep}
              theme={theme}
              ticksPerReading={ticksPerReading}
              readingProgressByStep={readingProgressByStep}
              completedReadingSteps={completedReadingSteps}
              paceWarmthByStep={paceWarmthByStep}
              shiningTick={shiningTick}
            />
            <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
              <AdaptivePaceSlider
                theme={theme}
                value={readingPacePreference}
                onChange={setReadingPacePreference}
              />
            </Box>
          </>
        ) : (
          <ProgressBar steps={steps} currentStep={currentStep} />
        )}
      </Box>
      <Box ref={readingAreaRef} sx={{
        bgcolor: "secondary.paper",
        borderRadius: 3,
        p: 3,
        flex: 3,
        height: { xs: "auto", md: "100%" },
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        position: "relative",
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
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1f2ea transparent',
          }}>
          <FormSpace
            steps={steps}
            currentStep={currentStep}
            completedReadingSteps={completedReadingSteps}
            onCompleteReadingStep={handleCompleteReading}
          />
          {isAdaptive && currentStep === 0 ? (
            <AdaptiveThemePicker
              selectedTheme={selectedTheme}
              themes={adaptiveThemes}
              onSelect={(themeId) => {
                setSelectedTheme(themeId);
              }}
            />
          ) : null}
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
        <AttentionProbeModal
          open={probeOpen && activeProbeStepId !== null}
          onSelect={handleProbeResponse}
        />
      </Box>
    </Box>
  )
}

export default ExperienceB
