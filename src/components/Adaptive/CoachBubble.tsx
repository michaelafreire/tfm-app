import { Box, Typography } from "@mui/material";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";

type CoachBubbleProps = {
  message: string;
  theme: AdaptiveTheme;
};

function CoachBubble({ message, theme }: CoachBubbleProps) {
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
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {message}
      </Typography>
    </Box>
  );
}

export default CoachBubble;
