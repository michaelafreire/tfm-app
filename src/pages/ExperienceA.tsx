import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import experimentImage from '../assets/experiment.png';
import AdaptiveProgressBar, { type MarkerStyle } from '../components/Adaptive/AdaptiveProgressBar';
import CheckpointPlanSelector from '../components/Adaptive/CheckpointPlanSelector';
import AttentionProbeModal from '../components/Adaptive/AttentionProbeModal';
import ReadingCompanionRail from "../components/Adaptive/ReadingCompanionRail";
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
import { stepsByGroup } from './experienceStepsA';
import type { Step } from './experienceStepsA';
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
  logAdaptiveInteraction,
  type AdaptiveInteractionAction,
  type AdaptiveInteractionLogPayload,
} from "../services/adaptiveInteractionLog";
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
  direction: "more" | "less" | "same";
  message: string;
  actionLabel: string;
} | null;
type PendingAdaptiveInteraction = Omit<AdaptiveInteractionLogPayload, "participant_action" | "participant_action_at">;
const GAZE_SAMPLE_INTERVAL_MS = 100;
const CHECKPOINT_DIM_START_MS = 30_000;
const CHECKPOINT_DIM_FULL_MS = 75_000;
const COMPANION_SLEEPY_START_MS = 140_000;
const gazeStorageKey = (participantCode: string, task: "A" | "B") => `tfm-gaze:${task}:${participantCode}`;

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

function ExperienceA() {
  const location = useLocation();
  const routeState = (location.state as ExperimentRouteState | null) ?? {};
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const participantCode = routeState.participantCode;
  const groupNumber = routeState.groupNumber;
  const condition = groupNumber ? getExperienceCondition(groupNumber, "A") : "nonAdaptive";
  const isAdaptive = condition === "adaptive";
  const draftKey = `tfm-draft:experiencea:${participantCode ?? "unknown"}`;
  const savedDraft = useMemo(
    () => readLocalDraft(draftKey, {
      currentStep: 0,
      answers: {} as Record<string, string>,
      completedReadingSteps: {} as Record<string, boolean>,
      readingProgressByStep: {} as Record<string, number>,
      checkpointCountsByStep: {} as Record<string, number>,
      completedCheckpointsByStep: {} as Record<string, number>,
      checkpointPlacementsByStep: {} as Record<string, CheckpointPlacement[]>,
      markerStyle: "calm" as MarkerStyle,
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
  const [sleepyCompanionByStep, setSleepyCompanionByStep] = useState<Record<string, boolean>>({});
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
  const activeProbeStepIdRef = useRef<string | null>(null);
  const probeShownAtRef = useRef<number | null>(null);
  const lastScrollAtRef = useRef<Record<string, number>>({});
  const scheduledProbeStepIdsRef = useRef<Record<string, boolean>>({});
  const shineTimerRef = useRef<number | null>(null);
  const scrollStatsRef = useRef<Record<string, ScrollReadingStats>>({});
  const initialPlanRequestedRef = useRef(false);
  const pendingAdaptiveInteractionsRef = useRef<Record<string, PendingAdaptiveInteraction>>({});
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
    () => translateExperienceSteps(rawSteps, routeState.language ?? i18n.language, 1),
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
      phase: "experiencea",
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
    direction: "more" | "less" | "same",
    message: string,
    interaction?: PendingAdaptiveInteraction,
  ) => {
    if (!isAdaptive) return;
    if (interaction) {
      pendingAdaptiveInteractionsRef.current[step.id] = interaction;
    }

    const currentCount = checkpointCountsByStep[step.id] ?? 3;
    if (direction === "same") {
      setCheckpointSuggestion({
        stepId: step.id,
        direction,
        message,
        actionLabel: t("adaptive.keepCheckpointCount"),
      });
      setAiReadingNotesByStep((prev) => ({
        ...prev,
        [step.id]: message,
      }));
      return;
    }

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

  const completePendingAdaptiveInteraction = useCallback((stepId: string, action: AdaptiveInteractionAction) => {
    const interaction = pendingAdaptiveInteractionsRef.current[stepId];
    if (!interaction) return;

    delete pendingAdaptiveInteractionsRef.current[stepId];
    logAdaptiveInteraction({
      ...interaction,
      participant_action: action,
      participant_action_at: new Date().toISOString(),
    });
  }, []);

  const applyCheckpointSuggestion = useCallback(() => {
    if (!checkpointSuggestion) return;

    const { stepId, direction } = checkpointSuggestion;
    completePendingAdaptiveInteraction(stepId, "accepted");
    if (direction === "same") {
      setCheckpointSuggestion(null);
      setAiReadingNotesByStep((prev) => ({
        ...prev,
        [stepId]: t("adaptive.doneKept"),
      }));
      return;
    }

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
  }, [checkpointCountsByStep, checkpointSuggestion, completePendingAdaptiveInteraction, t]);

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
  const getMilestonePercents = useCallback((step: Step) => {
    const paragraphCount = step.description.split("\n").map((line) => line.trim()).filter(Boolean).length;
    const placements = checkpointPlacementsByStep[step.id] ?? [];
    const total = checkpointCountsByStep[step.id] ?? recommendedCheckpointCount;
    if (placements.length !== Math.max(0, total - 1)) {
      return Array.from({ length: total }, (_, index) => ((index + 1) / total) * 100);
    }

    const percents = placements.map((placement) => {
      const paragraphIndex = Math.max(1, Math.min(paragraphCount, placement.afterParagraph));
      return (paragraphIndex / Math.max(1, paragraphCount)) * 100;
    });
    while (percents.length < total) percents.push(100);
    return percents.slice(0, total);
  }, [checkpointCountsByStep, checkpointPlacementsByStep, recommendedCheckpointCount]);

  useEffect(() => {
    if (!isAdaptive || isInitialPlanLoading || readingSteps.length === 0) return;
    const firstReading = readingSteps[0];
    setAiReadingNotesByStep((prev) => {
      if (prev[firstReading.id]) return prev;
      return {
        ...prev,
        [firstReading.id]: t("adaptive.initialCompanionMessage", { count: checkpointCountsByStep[firstReading.id] ?? recommendedCheckpointCount }),
      };
    });
  }, [checkpointCountsByStep, isAdaptive, isInitialPlanLoading, readingSteps, recommendedCheckpointCount, t]);

  useEffect(() => {
    if (!isAdaptive || readingSteps.length === 0 || initialPlanRequestedRef.current) return;

    initialPlanRequestedRef.current = true;
    setIsInitialPlanLoading(true);
    const initialPlanRequest = {
        event: "initial_plan",
        language: routeState.language ?? i18n.language,
        asrsPartAScore: routeState.asrsPartAScore ?? null,
        asrsClassification: routeState.asrsClassification ?? null,
        readings: readingSteps.map((step) => ({
          stepId: step.id,
          label: step.label,
          text: step.description,
          questionCount: step.question.length,
        })),
      };
    void getInitialCheckpointPlan(
      initialPlanRequest,
      localRecommendedCheckpointCount,
    ).then((plan) => {
      if (plan) {
        logAdaptiveInteraction({
          participant_code: participantCode,
          group_number: groupNumber,
          experience: "A",
          phase: "experiencea",
          interaction_type: "initial_plan",
          source_step_id: null,
          target_step_id: readingSteps[0]?.id ?? null,
          request_payload: initialPlanRequest,
          response_payload: plan,
          response_source: plan.source,
          recommendation: null,
          message: plan.reason,
          participant_action: "not_applicable",
          participant_action_at: null,
        });
        setAiRecommendedCheckpointCount(plan.recommendedCheckpoints);
        setAiRecommendationReason(plan.reason);
        setAiReadingNotesByStep((prev) => ({
          ...prev,
          [readingSteps[0].id]: plan.reason,
        }));
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
    groupNumber,
    participantCode,
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

    if (!isReadingStep(step)) {
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
      const shownAt = Date.now();
      activeProbeStepIdRef.current = step.id;
      probeShownAtRef.current = shownAt;
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
      setSleepyCompanionByStep((prev) => (prev[step.id] ? { ...prev, [step.id]: false } : prev));
      setProbeAttentionWarningByStep((prev) => (prev[step.id] ? { ...prev, [step.id]: false } : prev));

      const maxScroll = container.scrollHeight - container.clientHeight;
      const nextProgress = maxScroll <= 0
        ? 100
        : Math.max(0, Math.min(100, (container.scrollTop / maxScroll) * 100));

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
        const aiMilestoneCompleted = getMilestonePercents(step).filter((percent) => percent <= nextProgress).length;
        const hasMatchingAiPlacements = (checkpointPlacementsByStep[step.id]?.length ?? 0) === Math.max(0, totalCheckpoints - 1);
        const nextCompleted = checkpointDividers.length > 0
          ? dividerCompleted
          : hasMatchingAiPlacements
            ? aiMilestoneCompleted
            : fallbackCompleted;
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
    const stepId = activeProbeStepIdRef.current ?? activeProbeStepId ?? steps[currentStep]?.id;
    const shownAt = probeShownAtRef.current ?? Date.now();
    const answeredAt = Date.now();

    setProbeOpen(false);
    setActiveProbeStepId(null);
    activeProbeStepIdRef.current = null;
    probeShownAtRef.current = null;

    if (stepId) {
      const existingRecord = probeRecordsRef.current.find((record) => record.stepId === stepId);
      if (existingRecord) {
        existingRecord.shownAt = shownAt;
        existingRecord.answeredAt = answeredAt;
        existingRecord.response = response;
      } else {
        probeRecordsRef.current.push({
          stepId,
          scheduledAt: shownAt,
          shownAt,
          answeredAt,
          response,
        });
      }

      if (response !== "task-focused") {
        setProbeAttentionWarningByStep((prev) => ({ ...prev, [stepId]: true }));
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
      const nextSleepy = noScrollMs >= COMPANION_SLEEPY_START_MS;

      setSleepyCompanionByStep((prev) => {
        if ((prev[currentStepId] ?? false) === nextSleepy) return prev;
        return { ...prev, [currentStepId]: nextSleepy };
      });

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
    completePendingAdaptiveInteraction(stepId, "ignored");

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
      const afterReadingRequest = {
        language: routeState.language ?? i18n.language,
        companionName: t(`adaptive.companions.${markerStyle}`),
        currentCheckpointCount: checkpointCountsByStep[stepId] ?? recommendedCheckpointCount,
        scrollDirectionChanges: stats?.directionChanges ?? 0,
        probeResponse,
        probeResponseTimeMs,
        longestNoScrollMs,
      };
      const aiSuggestion = await getAfterReadingSuggestion(afterReadingRequest);

      if (aiSuggestion && nextReadingStep) {
        const interaction: PendingAdaptiveInteraction = {
          participant_code: participantCode,
          group_number: groupNumber,
          experience: "A",
          phase: "experiencea",
          interaction_type: "after_reading",
          source_step_id: stepId,
          target_step_id: nextReadingStep.id,
          request_payload: afterReadingRequest,
          response_payload: aiSuggestion,
          response_source: aiSuggestion.source,
          recommendation: aiSuggestion.recommendation,
          message: aiSuggestion.message,
        };
        if (aiSuggestion.recommendation === "add_checkpoint") {
          suggestCheckpointChange(nextReadingStep, "more", aiSuggestion.message, interaction);
        } else if (aiSuggestion.recommendation === "reduce_checkpoints") {
          suggestCheckpointChange(nextReadingStep, "less", aiSuggestion.message, interaction);
        } else {
          suggestCheckpointChange(nextReadingStep, "same", aiSuggestion.message, interaction);
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
            suggestCheckpointChange(nextReadingStep, "more", backupSuggestion.message, {
              participant_code: participantCode,
              group_number: groupNumber,
              experience: "A",
              phase: "experiencea",
              interaction_type: "after_reading",
              source_step_id: stepId,
              target_step_id: nextReadingStep.id,
              request_payload: afterReadingRequest,
              response_payload: backupSuggestion,
              response_source: "fallback",
              recommendation: backupSuggestion.direction,
              message: backupSuggestion.message,
            });
          } else if (backupSuggestion.direction === "less") {
            suggestCheckpointChange(nextReadingStep, "less", backupSuggestion.message, {
              participant_code: participantCode,
              group_number: groupNumber,
              experience: "A",
              phase: "experiencea",
              interaction_type: "after_reading",
              source_step_id: stepId,
              target_step_id: nextReadingStep.id,
              request_payload: afterReadingRequest,
              response_payload: backupSuggestion,
              response_source: "fallback",
              recommendation: backupSuggestion.direction,
              message: backupSuggestion.message,
            });
          } else {
            suggestCheckpointChange(nextReadingStep, "same", backupSuggestion.message, {
              participant_code: participantCode,
              group_number: groupNumber,
              experience: "A",
              phase: "experiencea",
              interaction_type: "after_reading",
              source_step_id: stepId,
              target_step_id: nextReadingStep.id,
              request_payload: afterReadingRequest,
              response_payload: backupSuggestion,
              response_source: "fallback",
              recommendation: backupSuggestion.direction,
              message: backupSuggestion.message,
            });
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
    const probeColumns = Object.fromEntries(
      readingSteps.flatMap((step, index) => {
        const readingNumber = index + 1;
        return [
          [`e1_r${readingNumber}_p`, probeAnswerByStepId[step.id] ?? null],
          [`e1_r${readingNumber}_p_time`, probeResponseTimeByStepId[step.id] ?? null],
        ];
      })
    );

    return supabase.from("responses").insert([
      {
        participant_code: participantCode,
        group_number: groupNumber,
        phase: "experiencea",
        calibration_experience: routeState.calibrationExperience ?? "A",
        calibration_accuracy_percent: routeState.calibrationAccuracyPercent ?? null,
        calibration_average_error_px: routeState.calibrationAverageErrorPx ?? null,
        ...probeColumns,
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

      const readingStepIds = readingSteps.map((step) => step.id);

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
          task: "A",
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

      try {
        window.localStorage.setItem(gazeStorageKey(participantCode, "A"), JSON.stringify(rawData));
      } catch (error) {
        console.error("Failed to save Experience A gaze data locally for CSV export", error);
      }

      clearDraft();
      writeLocalSession({
        participantCode,
        groupNumber,
        language: routeState.language,
        phase: "break",
      });

      navigate('/break', {
        state: {
          participantCode,
          groupNumber,
          language: routeState.language,
          asrsPartAScore: routeState.asrsPartAScore,
          asrsClassification: routeState.asrsClassification,
        },
      });
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
        p: { xs: 2.25, md: 2 },
        flex: "0 0 auto",
        minHeight: { xs: 170, md: 132 },
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        position: "relative",
      }}>
        <Box sx={{ position: "absolute", top: { xs: 18, md: 20 }, right: { xs: 18, md: 20 } }}>
          <PartPill label={t("part.two")} />
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
            {t("experienceIntro.titleA")}
          </Typography>
        </Box>
        {isAdaptive ? (
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
            pr: isAdaptive && currentStepIsReading && !currentStepCompleted ? { xs: 0, md: 20 } : 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isAdaptive && currentStepIsReading && !currentStepCompleted ? 'transparent' : '#d1f2ea',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: isAdaptive && currentStepIsReading && !currentStepCompleted ? 'transparent transparent' : '#d1f2ea transparent',
          }}>
          <FormSpace
            steps={steps}
            currentStep={currentStep}
            completedReadingSteps={completedReadingSteps}
            onCompleteReadingStep={handleCompleteReading}
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
        {isAdaptive && currentStepIsReading && !currentStepCompleted && currentStepId ? (
          <Box
            sx={{
              position: "absolute",
              top: 24,
              right: 6,
              bottom: 96,
              display: { xs: "none", md: "block" },
            }}
          >
            <ReadingCompanionRail
              theme={theme}
              companionStyle={markerStyle}
              total={checkpointCountsByStep[currentStepId] ?? recommendedCheckpointCount}
              completed={completedCheckpointsByStep[currentStepId] ?? 0}
              progress={readingProgressByStep[currentStepId] ?? 0}
              milestonePercents={getMilestonePercents(steps[currentStep])}
              message={aiReadingNotesByStep[currentStepId]}
              actionLabel={checkpointSuggestion?.stepId === currentStepId ? checkpointSuggestion.actionLabel : undefined}
              onAction={checkpointSuggestion?.stepId === currentStepId ? applyCheckpointSuggestion : undefined}
              onDismiss={(reason) => completePendingAdaptiveInteraction(currentStepId, reason)}
              isShining={shiningCheckpoint?.stepId === currentStepId}
              rewardCheckpointIndex={shiningCheckpoint?.stepId === currentStepId ? shiningCheckpoint.checkpointIndex : undefined}
              isSleepy={sleepyCompanionByStep[currentStepId] === true}
            />
          </Box>
        ) : null}
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

export default ExperienceA
