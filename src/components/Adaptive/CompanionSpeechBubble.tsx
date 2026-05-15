import { Box, Button, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";

type CompanionSpeechBubbleProps = {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  theme: AdaptiveTheme;
  compact?: boolean;
  pointerSide?: "left" | "right";
};

function CompanionSpeechBubble({
  message,
  actionLabel,
  onAction,
  onDismiss,
  theme,
  compact = false,
  pointerSide = "left",
}: CompanionSpeechBubbleProps) {
  if (!message && !actionLabel) return null;

  return (
    <Box
      sx={{
        position: "relative",
        width: compact ? 320 : 340,
        maxWidth: compact ? 320 : 340,
        bgcolor: "background.paper",
        border: `1px solid ${alpha(theme.accent, 0.16)}`,
        borderRadius: 2,
        px: compact ? 1.6 : 1.8,
        py: compact ? 1.15 : 1.25,
        boxShadow: "0 8px 24px rgba(38,42,44,0.08)",
        "&::before": {
          content: '""',
          position: "absolute",
          left: pointerSide === "left" ? -7 : "auto",
          right: pointerSide === "right" ? -7 : "auto",
          top: "50%",
          width: 12,
          height: 12,
          bgcolor: "background.paper",
          borderLeft: pointerSide === "left" ? `1px solid ${alpha(theme.accent, 0.16)}` : "none",
          borderRight: pointerSide === "right" ? `1px solid ${alpha(theme.accent, 0.16)}` : "none",
          borderBottom: `1px solid ${alpha(theme.accent, 0.16)}`,
          transform: `translateY(-50%) rotate(${pointerSide === "left" ? 45 : -45}deg)`,
        },
      }}
    >
      {onDismiss ? (
        <Box
          component="button"
          type="button"
          aria-label="Close AI message"
          onClick={onDismiss}
          sx={{
            position: "absolute",
            top: compact ? -9 : -10,
            right: compact ? -9 : -10,
            width: compact ? 20 : 24,
            height: compact ? 20 : 24,
            border: "none",
            borderRadius: "50%",
            bgcolor: theme.accent,
            color: "#fff",
            cursor: "pointer",
            fontSize: compact ? 15 : 18,
            fontWeight: 800,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${alpha(theme.accent, 0.22)}`,
            "&:hover": {
              filter: "brightness(0.94)",
            },
          }}
        >
          x
        </Box>
      ) : null}
      {message ? (
        <Typography
          variant="caption"
          sx={{
            color: "text.primary",
            display: "block",
            lineHeight: 1.35,
            fontWeight: 700,
            overflowWrap: "break-word",
            hyphens: "auto",
            maxWidth: "100%",
          }}
        >
          {message}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          size="small"
          onClick={onAction}
          sx={{
            mt: message ? 0.75 : 0,
            minHeight: 0,
            p: 0,
            color: theme.accent,
            fontWeight: 800,
            fontSize: "0.72rem",
            textTransform: "none",
            "&:hover": {
              bgcolor: "transparent",
              color: theme.accent,
              filter: "brightness(0.9)",
            },
          }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}

export default CompanionSpeechBubble;
