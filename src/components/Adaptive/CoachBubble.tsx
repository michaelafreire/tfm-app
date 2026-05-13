import { Box, Typography } from "@mui/material";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";

type CoachBubbleProps = {
  message: string;
  theme: AdaptiveTheme;
  actionLabel?: string;
  onAction?: () => void;
};

function CoachBubble({ message, theme, actionLabel, onAction }: CoachBubbleProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        px: 2,
        py: 1.25,
        borderRadius: 3,
        backgroundColor: "background.paper",
        border: `1px solid ${theme.soft}`,
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
        maxWidth: 420,
        width: "100%",
      }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.gradient,
          color: "#fff",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        AI
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          {message}
        </Typography>
        {actionLabel && onAction ? (
          <Box
            component="button"
            type="button"
            onClick={onAction}
            sx={{
              mt: 1,
              border: "none",
              borderRadius: 2,
              px: 1.5,
              py: 0.85,
              bgcolor: theme.accent,
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(0,0,0,0.14)",
              minWidth: 150,
              textAlign: "center",
              "&:hover": {
                filter: "brightness(0.96)",
              },
            }}
          >
            {actionLabel}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

export default CoachBubble;
