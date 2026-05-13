import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import experimentImage from '../assets/experiment.png';
import AdaptiveProgressBar, { type MarkerStyle } from '../components/Adaptive/AdaptiveProgressBar';
import CheckpointPlanSelector from '../components/Adaptive/CheckpointPlanSelector';
import AttentionProbeModal from '../components/Adaptive/AttentionProbeModal';
import CoachBubble from '../components/Adaptive/CoachBubble';
import ColorButton from '../components/ColorButton';
import FormSpace from '../components/Form/FormSpace';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import PartPill from '../components/PartPill';
import { getAdaptiveTheme, getExperienceCondition } from '../experiment/adaptiveConfig';
import {
  buildBackupCheckpointSuggestion,
  clampCheckpointCount,
  createScrollReadingStats,
  recommendCheckpointCount,
  type ScrollReadingStats,
} from '../experiment/checkpointPlan';
import type { ExperimentRouteState } from '../experiment/routeState';
import { stepsByGroup } from './experienceStepsB';
import type { Step } from './experienceStepsB';
import { translateExperienceSteps } from './experienceTranslations';
import { supabase } from "../supabaseClient";
import { getRandomProbeDelayMs } from "../experiment/probeTiming";
import { readLocalDraft, useLocalDraft, writeLocalSession } from "../hooks/useLocalDraft";
import {
  getAfterReadingSuggestion,
  getInitialCheckpointPlan,
  type CheckpointPlacement,
} from "../services/adaptiveAI";
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
type CheckpointSuggestion = {
  stepId: string;
  direction: "more" | "less";
  message: string;
  actionLabel: string;
} | null;
const GAZE_SAMPLE_INTERVAL_MS = 100;
const CHECKPOINT_DIM_START_MS = 30_000;
const CHECKPOINT_DIM_FULL_MS = 75_000;
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
      answers: {} as Record<string, string>,
      completedReadingSteps: {} as Record<string, boolean>,
      readingProgressByStep: {} as Record<string, number>,
      checkpointCountsByStep: {} as Record<string, number>,
      completedCheckpointsByStep: {} as Record<string, number>,
      checkpointPlacementsByStep: {} as Record<string, CheckpointPlacement[]>,
      markerStyle: "diamond" as MarkerStyle,
      aiRecommendedCheckpointCount: undefined as number | undefined,
      aiRecommendationReason: undefined as string | undefined,
      aiReadingNotesByStep: {} as Record<string, string>,
    }),
    [draftKey],
  );
  const [currentStep, setCurrentStep] = useState<number>(savedDraft.currentStep);
  const selectedTheme = "pastel";
  const theme = getAdaptiveTheme(selectedTheme);
  const [checkpointSuggestion, setCheckpointSuggestion] = useState<CheckpointSuggestion>(null);
  const [aiReadingNotesByStep, setAiReadingNotesByStep] = useState<Record<string, string>>(savedDraft.aiReadingNotesByStep);
  const [answers, setAnswers] = useState<Record<string, string>>(savedDraft.answers);
  const [completedReadingSteps, setCompletedReadingSteps] = useState<Record<string, boolean>>(savedDraft.completedReadingSteps);
  const [readingProgressByStep, setReadingProgressByStep] = useState<Record<string, number>>(savedDraft.readingProgressByStep);
  const [checkpointCountsByStep, setCheckpointCountsByStep] = useState<Record<string, number>>(savedDraft.checkpointCountsByStep);
  const [completedCheckpointsByStep, setCompletedCheckpointsByStep] = useState<Record<string, number>>(savedDraft.completedCheckpointsByStep);
  const [checkpointPlacementsByStep, setCheckpointPlacementsByStep] = useState<Record<string, CheckpointPlacement[]>>(savedDraft.checkpointPlacementsByStep);
  const [aiRecommendedCheckpointCount, setAiRecommendedCheckpointCount] = useState<number | undefined>(savedDraft.aiRecommendedCheckpointCount);
  const [aiRecommendationReason, setAiRecommendationReason] = useState<string | undefined>(savedDraft.aiRecommendationReason);
  const [isInitialPlanLoading, setIsInitialPlanLoading] = useState(isAdaptive && !savedDraft.aiRecommendedCheckpointCount);
  const [markerStyle, setMarkerStyle] = useState<MarkerStyle>(savedDraft.markerStyle);
  const [shiningCheckpoint, setShiningCheckpoint] = useState<{ stepId: string; checkpointIndex: number } | null>(null);
  const [checkpointDimByStep, setCheckpointDimByStep] = useState<Record<string, number>>({});
  const [probeAttentionWarningByStep, setProbeAttentionWarningByStep] = useState<Record<string, boolean>>({});
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
  const lastScrollAtRef = useRef<Record<string, number>>({});
  const scheduledProbeStepIdsRef = useRef<Record<string, boolean>>({});
  const shineTimerRef = useRef<number | null>(null);
  const scrollStatsRef = useRef<Record<string, ScrollReadingStats>>({});
  const initialPlanRequestedRef = useRef(false);
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
      answers,
      completedReadingSteps,
      readingProgressByStep,
      checkpointCountsByStep,
      completedCheckpointsByStep,
      checkpointPlacementsByStep,
      aiRecommendedCheckpointCount,
      aiRecommendationReason,
      aiReadingNotesByStep,
      markerStyle,
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

  const suggestCheckpointChange = useCallback((
    step: Step,
    direction: "more" | "less",
    message: string,
  ) => {
    if (!isAdaptive) return;

    const currentCount = checkpointCountsByStep[step.id] ?? 3;
    if ((direction === "more" && currentCount >= 5) || (direction === "less" && currentCount <= 1)) {
      setAiReadingNotesByStep((prev) => ({
        ...prev,
        [step.id]: t("adaptive.planLooksRight"),
      }));
      return;
    }

    setCheckpointSuggestion({
      stepId: step.id,
      direction,
      message,
      actionLabel: direction === "more" ? t("adaptive.addCheckpoint") : t("adaptive.useFewerCheckpoints"),
    });
    setAiReadingNotesByStep((prev) => ({
      ...prev,
      [step.id]: message,
    }));
  }, [
    checkpointCountsByStep,
    isAdaptive,
    t,
  ]);

  const applyCheckpointSuggestion = useCallback(() => {
    if (!checkpointSuggestion) return;

    const { stepId, direction } = checkpointSuggestion;
    setCheckpointCountsByStep((prev) => {
      const nextCount = clampCheckpointCount((prev[stepId] ?? 3) + (direction === "more" ? 1 : -1));
      return { ...prev, [stepId]: nextCount };
    });
    setCompletedCheckpointsByStep((prev) => {
      const currentCount = checkpointCountsByStep[stepId] ?? 3;
      const nextCount = clampCheckpointCount(currentCount + (direction === "more" ? 1 : -1));
      return { ...prev, [stepId]: Math.min(prev[stepId] ?? 0, nextCount) };
    });
    setCheckpointSuggestion(null);
    setAiReadingNotesByStep((prev) => ({
      ...prev,
      [stepId]: direction === "more"
        ? t("adaptive.doneAdded")
        : t("adaptive.doneReduced"),
    }));
  }, [checkpointCountsByStep, checkpointSuggestion, t]);

  const resetStallTimer = useCallback((step: Step) => {
    if (!isAdaptive || !isReadingStep(step) || completedReadingSteps[step.id]) return;

    if (stallTimerRef.current) {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, [completedReadingSteps, isAdaptive]);

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
  const readingSteps = useMemo(() => steps.filter(isReadingStep), [steps]);
  const localRecommendedCheckpointCount = useMemo(
    () => recommendCheckpointCount(readingSteps, routeState.asrsPartAScore),
    [readingSteps, routeState.asrsPartAScore],
  );
  const recommendedCheckpointCount = aiRecommendedCheckpointCount ?? localRecommendedCheckpointCount;

  useEffect(() => {
    if (!isAdaptive || readingSteps.length === 0 || initialPlanRequestedRef.current) return;

    initialPlanRequestedRef.current = true;
    setIsInitialPlanLoading(true);
    void getInitialCheckpointPlan(
      {
        language: routeState.language ?? i18n.language,
        asrsPartAScore: routeState.asrsPartAScore,
        asrsClassification: routeState.asrsClassification,
        readings: readingSteps.map((step) => ({
          stepId: step.id,
          label: step.label,
          text: step.description,
          questionCount: step.question.length,
        })),
      },
      localRecommendedCheckpointCount,
    ).then((plan) => {
      if (plan) {
        setAiRecommendedCheckpointCount(plan.recommendedCheckpoints);
        setAiRecommendationReason(plan.reason);
        setCheckpointCountsByStep((prev) => {
          const next = { ...prev };
          plan.readings.forEach((reading) => {
            next[reading.stepId] = reading.checkpointCount;
          });
          return next;
        });
        setCheckpointPlacementsByStep((prev) => {
          const next = { ...prev };
          plan.readings.forEach((reading) => {
            next[reading.stepId] = reading.checkpoints;
          });
          return next;
        });
      }
    }).finally(() => {
      setIsInitialPlanLoading(false);
    });
  }, [
    i18n.language,
    isAdaptive,
    localRecommendedCheckpointCount,
    readingSteps,
    routeState.asrsClassification,
    routeState.asrsPartAScore,
    routeState.language,
  ]);

  useEffect(() => {
    if (!isAdaptive || readingSteps.length === 0) return;

    setCheckpointCountsByStep((prev) => {
      let hasChanges = false;
      const next = { ...prev };
      readingSteps.forEach((step) => {
        if (!next[step.id]) {
          next[step.id] = recommendedCheckpointCount;
          hasChanges = true;
        }
      });
      return hasChanges ? next : prev;
    });
  }, [isAdaptive, readingSteps, recommendedCheckpointCount]);

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
  }, [currentStep, isAdaptive]);

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
    scrollStatsRef.current[step.id] = scrollStatsRef.current[step.id] ?? createScrollReadingStats(contentRef.current?.scrollTop ?? 0);

    resetStallTimer(step);

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
    };
  }, [currentStep, currentStepCompleted, currentStepId, currentStepIsReading, resetStallTimer, steps]);

  useEffect(() => {
    const container = contentRef.current;
    const step = steps[currentStep];

    if (!container || !step || !currentStepIsReading || currentStepCompleted) {
      return;
    }

    const handleScroll = () => {
      const now = Date.now();
      const previousScrollAt = lastScrollAtRef.current[step.id] ?? now;
      lastScrollAtRef.current[step.id] = now;
      setProbeAttentionWarningByStep((prev) => (prev[step.id] ? { ...prev, [step.id]: false } : prev));

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

      if (isAdaptive) {
        const stats = scrollStatsRef.current[step.id] ?? createScrollReadingStats(container.scrollTop);
        const nextDirection = container.scrollTop > stats.lastTop ? 1 : container.scrollTop < stats.lastTop ? -1 : 0;
        if (nextDirection !== 0 && stats.direction !== 0 && nextDirection !== stats.direction) {
          stats.directionChanges += 1;
        }
        stats.direction = nextDirection;
        stats.lastTop = container.scrollTop;
        stats.scrollEvents += 1;
        stats.maxProgress = Math.max(stats.maxProgress, nextProgress);
        stats.maxTimeWithoutScrollMs = Math.max(stats.maxTimeWithoutScrollMs, now - previousScrollAt);
        scrollStatsRef.current[step.id] = stats;

        const totalCheckpoints = checkpointCountsByStep[step.id] ?? recommendedCheckpointCount;
        const checkpointDividers = Array.from(
          container.querySelectorAll<HTMLElement>(`[data-checkpoint-step="${step.id}"]`)
        );
        const passLine = container.scrollTop + 8;
        const bottomReached = maxScroll <= 0 || container.scrollTop >= maxScroll - 8;
        const dividerCompleted = checkpointDividers.filter((divider, index) => {
          const isFinalDivider = index === checkpointDividers.length - 1;
          return divider.offsetTop <= passLine || (isFinalDivider && bottomReached);
        }).length;
        const checkpointSize = 100 / totalCheckpoints;
        const fallbackCompleted = Math.min(totalCheckpoints, Math.floor(nextProgress / checkpointSize));
        const nextCompleted = checkpointDividers.length > 0 ? dividerCompleted : fallbackCompleted;
        const previousCompleted = completedCheckpointsByStep[step.id] ?? 0;

        if (nextCompleted !== previousCompleted) {
          setCompletedCheckpointsByStep((prev) => ({
            ...prev,
            [step.id]: nextCompleted,
          }));

          if (nextCompleted > previousCompleted) {
            setShiningCheckpoint({
              stepId: step.id,
              checkpointIndex: nextCompleted - 1,
            });
            if (shineTimerRef.current) {
              window.clearTimeout(shineTimerRef.current);
            }
            shineTimerRef.current = window.setTimeout(() => {
              setShiningCheckpoint((current) =>
                current?.stepId === step.id && current.checkpointIndex === nextCompleted - 1 ? null : current
              );
            }, 700);
          } else {
            setShiningCheckpoint((current) => (current?.stepId === step.id ? null : current));
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [
    checkpointCountsByStep,
    completedCheckpointsByStep,
    currentStep,
    currentStepCompleted,
    currentStepId,
    currentStepIsReading,
    isAdaptive,
    recommendedCheckpointCount,
    resetStallTimer,
    steps,
  ]);

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

      if (response !== "task-focused") {
        setProbeAttentionWarningByStep((prev) => ({ ...prev, [step.id]: true }));
      }

    }
  };

  useEffect(() => {
    if (!isAdaptive || !currentStepId || !currentStepIsReading || currentStepCompleted) return;

    const updateDim = () => {
      const lastScrollAt = lastScrollAtRef.current[currentStepId] ?? Date.now();
      const noScrollMs = Date.now() - lastScrollAt;
      const noScrollDim = Math.max(
        0,
        Math.min(1, (noScrollMs - CHECKPOINT_DIM_START_MS) / (CHECKPOINT_DIM_FULL_MS - CHECKPOINT_DIM_START_MS))
      );
      const probeDim = probeAttentionWarningByStep[currentStepId] ? 0.85 : 0;
      const nextDim = Math.max(noScrollDim, probeDim);

      setCheckpointDimByStep((prev) => {
        if (Math.abs((prev[currentStepId] ?? 0) - nextDim) < 0.03) return prev;
        return { ...prev, [currentStepId]: nextDim };
      });
    };

    updateDim();
    const intervalId = window.setInterval(updateDim, 1000);
    return () => window.clearInterval(intervalId);
  }, [currentStepCompleted, currentStepId, currentStepIsReading, isAdaptive, probeAttentionWarningByStep]);

  const handleCompleteReading = async (stepId: string) => {
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
    setCompletedCheckpointsByStep((prev) => ({
      ...prev,
      [stepId]: checkpointCountsByStep[stepId] ?? recommendedCheckpointCount,
    }));

    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    });

    const completedStep = steps.find((step) => step.id === stepId);
    if (completedStep && isAdaptive) {
      const stats = scrollStatsRef.current[stepId];
      const probeRecord = probeRecordsRef.current.find((record) => record.stepId === stepId);
      const probeResponse = probeRecord?.response;
      const probeResponseTimeMs =
        probeRecord?.shownAt && probeRecord?.answeredAt ? probeRecord.answeredAt - probeRecord.shownAt : null;
      const longestNoScrollMs = stats
        ? Math.max(stats.maxTimeWithoutScrollMs, Date.now() - (lastScrollAtRef.current[stepId] ?? Date.now()))
        : null;
      const nextReadingStep = readingSteps.find((step) => Number(step.id) > Number(stepId));
      const aiSuggestion = await getAfterReadingSuggestion({
        language: routeState.language ?? i18n.language,
        currentCheckpointCount: checkpointCountsByStep[stepId] ?? recommendedCheckpointCount,
        scrollDirectionChanges: stats?.directionChanges ?? 0,
        probeResponse,
        probeResponseTimeMs,
        longestNoScrollMs,
      });

      if (aiSuggestion && nextReadingStep) {
        if (aiSuggestion.recommendation === "add_checkpoint") {
          suggestCheckpointChange(nextReadingStep, "more", aiSuggestion.message);
        } else if (aiSuggestion.recommendation === "reduce_checkpoints") {
          suggestCheckpointChange(nextReadingStep, "less", aiSuggestion.message);
        } else {
          setAiReadingNotesByStep((prev) => ({
            ...prev,
            [nextReadingStep.id]: aiSuggestion.message,
          }));
        }
        pauseTracking();
        setActiveSectionId(null);
        return;
      }

      if (nextReadingStep) {
        const nextReadingIndex = readingSteps.findIndex((step) => step.id === nextReadingStep.id);
        if (nextReadingIndex === 1 || nextReadingIndex === 2) {
          const backupSuggestion = buildBackupCheckpointSuggestion({
            currentCheckpointCount: checkpointCountsByStep[stepId] ?? recommendedCheckpointCount,
            scrollDirectionChanges: stats?.directionChanges ?? 0,
            probeResponse,
            probeResponseTimeMs,
            longestNoScrollMs,
            language: routeState.language ?? i18n.language,
          });

          if (backupSuggestion.direction === "more") {
            suggestCheckpointChange(nextReadingStep, "more", backupSuggestion.message);
          } else if (backupSuggestion.direction === "less") {
            suggestCheckpointChange(nextReadingStep, "less", backupSuggestion.message);
          } else {
            setAiReadingNotesByStep((prev) => ({
              ...prev,
              [nextReadingStep.id]: backupSuggestion.message,
            }));
          }
        }
      }
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

    if (isAdaptive && currentStep === 0 && isInitialPlanLoading) {
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
        </Box>
        {isAdaptive && currentStep > 0 ? (
          <>
            <AdaptiveProgressBar
              steps={steps.map(({ id, label }) => ({ id, label }))}
              currentStep={currentStep}
              theme={theme}
              checkpointCountsByStep={checkpointCountsByStep}
              completedCheckpointsByStep={completedCheckpointsByStep}
              markerStyle={markerStyle}
              markerDimByStep={checkpointDimByStep}
              shiningCheckpoint={shiningCheckpoint}
            />
          </>
        ) : !isAdaptive ? (
          <ProgressBar steps={steps} currentStep={currentStep} />
        ) : null}
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
            checkpointCountsByStep={isAdaptive ? checkpointCountsByStep : undefined}
            completedCheckpointsByStep={isAdaptive ? completedCheckpointsByStep : undefined}
            markerStyle={markerStyle}
            adaptiveTheme={isAdaptive ? theme : undefined}
            checkpointPlacementsByStep={isAdaptive ? checkpointPlacementsByStep : undefined}
            readingIntroByStep={
              isAdaptive && currentStepIsReading && !currentStepCompleted && currentStepId && aiReadingNotesByStep[currentStepId]
                ? {
                    [currentStepId]: (
                      <CoachBubble
                        message={aiReadingNotesByStep[currentStepId]}
                        theme={theme}
                        actionLabel={checkpointSuggestion?.stepId === currentStepId ? checkpointSuggestion.actionLabel : undefined}
                        onAction={checkpointSuggestion?.stepId === currentStepId ? applyCheckpointSuggestion : undefined}
                      />
                    ),
                  }
                : undefined
            }
            shiningCheckpoint={shiningCheckpoint}
          />
          {isAdaptive && currentStep === 0 ? (
            <CheckpointPlanSelector
              theme={theme}
              recommendedCount={recommendedCheckpointCount}
              selectedCount={checkpointCountsByStep[readingSteps[0]?.id ?? ""] ?? recommendedCheckpointCount}
              onCountChange={(count) => {
                setCheckpointCountsByStep((prev) => {
                  const next = { ...prev };
                  readingSteps.forEach((step) => {
                    next[step.id] = count;
                  });
                  return next;
                });
                setCompletedCheckpointsByStep({});
              }}
              markerStyle={markerStyle}
              onMarkerStyleChange={setMarkerStyle}
              readingCount={readingSteps.length}
              recommendationReason={aiRecommendationReason}
              isLoading={isInitialPlanLoading}
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
