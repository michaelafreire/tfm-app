import { Box, Slider } from "@mui/material";
import Typography from "@mui/material/Typography";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";

type AdaptivePaceSliderProps = {
  theme: AdaptiveTheme;
  value: number;
  onChange: (value: number) => void;
};

function AdaptivePaceSlider({ theme, value, onChange }: AdaptivePaceSliderProps) {
  return (
    <Box
      sx={{
        mt: 0.75,
        width: "100%",
        maxWidth: 210,
      }}
    >
      <Slider
        value={value}
        onChange={(_, nextValue) => onChange(nextValue as number)}
        min={-2}
        max={2}
        step={1}
        size="small"
        marks
        sx={{
          color: theme.accent,
          px: 0,
          mb: 0.25,
          "& .MuiSlider-rail": {
            opacity: 1,
            backgroundColor: "rgba(0, 0, 0, 0.12)",
          },
          "& .MuiSlider-track": {
            border: "none",
            background: theme.gradient,
          },
          "& .MuiSlider-thumb": {
            width: 18,
            height: 18,
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.16)",
            "&:hover, &.Mui-focusVisible, &.Mui-active": {
              boxShadow: "0 0 0 6px rgba(0, 0, 0, 0.08)",
            },
          },
          "& .MuiSlider-mark": {
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
          "& .MuiSlider-markLabel": {
            display: "none",
          },
        }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mt: 0.3,
          px: 0,
        }}
      >
        <Box sx={{ width: 76 }} />
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            lineHeight: 1,
            textAlign: "center",
            pt: 0.1,
            minWidth: 88,
            whiteSpace: "nowrap",
          }}
        >
          Reading Pace
        </Typography>
        <Box sx={{ width: 76 }} />
      </Box>
    </Box>
  );
}

export default AdaptivePaceSlider;
