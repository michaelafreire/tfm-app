import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";
import CompanionSpeechBubble from "./CompanionSpeechBubble";
import FocusCompanion from "./FocusCompanion";
import { getCompanionOption, type CompanionStyle } from "./AdaptiveProgressBar";

type ReadingCompanionRailProps = {
  theme: AdaptiveTheme;
  companionStyle: CompanionStyle;
  total: number;
  completed: number;
  progress: number;
  milestonePercents?: number[];
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  isShining?: boolean;
  rewardCheckpointIndex?: number;
  isSleepy?: boolean;
};

function ReadingCompanionRail({
  theme,
  companionStyle,
  total,
  completed,
  progress,
  milestonePercents,
  message,
  actionLabel,
  onAction,
  isShining = false,
  rewardCheckpointIndex,
  isSleepy = false,
}: ReadingCompanionRailProps) {
  const companion = getCompanionOption(companionStyle);
  const railColor = companion.color || theme.accent;
  const safeTotal = Math.max(1, total);
  const dotPercents = Array.from({ length: safeTotal }, (_, index) => {
    const aiPercent = milestonePercents?.[index];
    if (Number.isFinite(aiPercent)) return Math.max(0, Math.min(100, aiPercent as number));
    return safeTotal === 1 ? 100 : ((index + 1) / safeTotal) * 100;
  });
  const safeCompleted = Math.max(0, Math.min(completed, safeTotal));
  const activeIndex = Math.min(safeCompleted, safeTotal - 1);
  const milestonePercent = dotPercents[activeIndex] ?? 0;
  const liveProgressPercent = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : milestonePercent));
  const bubbleKey = useMemo(() => `${message ?? ""}|${actionLabel ?? ""}`, [actionLabel, message]);
  const [dismissedBubbleKey, setDismissedBubbleKey] = useState<string | null>(null);
  const visibleSinceRef = useRef<number | null>(null);
  const hasBubbleContent = Boolean(message || actionLabel);
  const showBubble = hasBubbleContent && dismissedBubbleKey !== bubbleKey;

  useEffect(() => {
    if (!hasBubbleContent || dismissedBubbleKey === bubbleKey) {
      visibleSinceRef.current = null;
      return;
    }

    visibleSinceRef.current = Date.now();
  }, [bubbleKey, dismissedBubbleKey, hasBubbleContent]);

  useEffect(() => {
    if (!showBubble) return undefined;

    const closeAfterSettledScroll = () => {
      const visibleSince = visibleSinceRef.current;
      if (!visibleSince) return;
      if (Date.now() - visibleSince < 10_000) return;
      setDismissedBubbleKey(bubbleKey);
    };

    window.addEventListener("scroll", closeAfterSettledScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", closeAfterSettledScroll, { capture: true });
    };
  }, [bubbleKey, showBubble]);

  return (
    <Box
      sx={{
        width: { xs: 0, md: 150 },
        height: "100%",
        display: { xs: "none", md: "flex" },
        justifyContent: "center",
        alignItems: "stretch",
        flexShrink: 0,
        pl: 1,
        ml: 0,
      }}
    >
      <Box sx={{ position: "relative", width: 84, height: "100%", minHeight: 0, my: 0 }}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 8,
            bottom: 8,
            width: 2,
            borderRadius: 999,
            bgcolor: alpha(railColor, 0.18),
            transform: "translateX(-50%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 8,
            height: `calc((100% - 16px) * ${liveProgressPercent / 100})`,
            width: 2,
            borderRadius: 999,
            bgcolor: railColor,
            transform: "translateX(-50%)",
          }}
        />
        {Array.from({ length: safeTotal }, (_, index) => {
          const dotPercent = dotPercents[index] ?? 100;
          const isDone = index < safeCompleted || dotPercent <= liveProgressPercent;
          const isActive = !isDone && index === activeIndex;
          const isRewarded = rewardCheckpointIndex === index;
          return (
            <Box
              key={`rail-dot-${index}`}
              sx={{
                position: "absolute",
                left: "50%",
                top: `${dotPercent}%`,
                width: isActive ? 12 : 10,
                height: isActive ? 12 : 10,
                borderRadius: "50%",
                bgcolor: isDone ? railColor : "background.paper",
                border: `2px solid ${isDone || isActive ? railColor : alpha("#262a2c", 0.16)}`,
                boxShadow: isActive ? `0 0 0 5px ${alpha(railColor, 0.1)}` : "none",
                transform: "translate(-50%, -50%)",
                transition: "all 300ms ease",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: -18,
                  borderRadius: "50%",
                  border: `4px solid ${alpha(railColor, 0.72)}`,
                  boxShadow: `0 0 30px ${alpha(railColor, 0.44)}`,
                  opacity: 0,
                  transform: "scale(0.28)",
                  animation: isRewarded ? "milestoneRing 980ms ease-out" : "none",
                },
                "@keyframes milestoneRing": {
                  "0%": { opacity: 0.95, transform: "scale(0.28)" },
                  "68%": { opacity: 0.22, transform: "scale(2.35)" },
                  "100%": { opacity: 0, transform: "scale(3)" },
                },
              }}
            />
          );
        })}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: `${liveProgressPercent}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 4,
          }}
        >
          <FocusCompanion style={companionStyle} size={34} active={isShining} sleepy={isSleepy} />
        </Box>
        {showBubble ? (
          <Box
            sx={{
              position: "absolute",
              right: 70,
              top: `${liveProgressPercent}%`,
              transform: "translateY(-50%)",
              zIndex: 3,
            }}
          >
            <CompanionSpeechBubble
              message={message}
              actionLabel={actionLabel}
              onAction={onAction}
              onDismiss={() => setDismissedBubbleKey(bubbleKey)}
              theme={{ ...theme, accent: railColor }}
              compact
              pointerSide="right"
            />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

export default ReadingCompanionRail;
