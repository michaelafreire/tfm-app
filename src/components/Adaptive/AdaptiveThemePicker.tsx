import { Box, Typography } from "@mui/material";
import type { AdaptiveTheme, AdaptiveThemeId } from "../../experiment/adaptiveConfig";

type AdaptiveThemePickerProps = {
  selectedTheme?: AdaptiveThemeId;
  themes: AdaptiveTheme[];
  onSelect: (themeId: AdaptiveThemeId) => void;
};

function AdaptiveThemePicker({
  selectedTheme,
  themes,
  onSelect,
}: AdaptiveThemePickerProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1, ml: 2 }}>
        Before beginning, customize your companion.
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, ml: 2, color: "text.secondary" }}>
        Your progress bar adapts to you. How would you like your journey to look?
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
          width: "100%",
          maxWidth: 680,
        }}
      >
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme.id;

          return (
            <Box
              key={theme.id}
              component="button"
              type="button"
              onClick={() => onSelect(theme.id)}
              sx={{
                border: isSelected ? `3px solid ${theme.accent}` : "2px solid transparent",
                borderRadius: 3,
                background: "transparent",
                padding: 1,
                cursor: "pointer",
                textAlign: "left",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                boxShadow: isSelected ? `0 10px 24px rgba(0,0,0,0.12)` : "0 6px 18px rgba(0,0,0,0.08)",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: 2,
                  background: theme.preview,
                  mb: 1,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: isSelected ? "bold" : 500, color: "text.primary" }}>
                {theme.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default AdaptiveThemePicker;
