import { Box, Button, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";
import { getMarkerColor, type MarkerStyle } from "./AdaptiveProgressBar";

type CheckpointPlanSelectorProps = {
  theme: AdaptiveTheme;
  recommendedCount: number;
  selectedCount: number;
  onCountChange: (count: number) => void;
  markerStyle: MarkerStyle;
  onMarkerStyleChange: (style: MarkerStyle) => void;
  readingCount: number;
  recommendationReason?: string;
  isLoading?: boolean;
};

const markerOptions: Array<{ value: MarkerStyle; label: string; icon: typeof DiamondRoundedIcon }> = [
  { value: "diamond", label: "Diamonds", icon: DiamondRoundedIcon },
  { value: "heart", label: "Hearts", icon: FavoriteRoundedIcon },
  { value: "star", label: "Stars", icon: StarRoundedIcon },
];

const previewLabels = ["Start", "Key idea 1", "Key idea 2", "Summary"];

function getCountOptions(recommendedCount: number) {
  const boundedRecommendation = Math.max(1, Math.min(5, recommendedCount));
  const options = new Set([1, boundedRecommendation, 5]);

  for (let count = 1; options.size < 3 && count <= 5; count += 1) {
    options.add(count);
  }

  return Array.from(options)
    .sort((a, b) => Math.abs(a - boundedRecommendation) - Math.abs(b - boundedRecommendation) || a - b)
    .slice(0, 3)
    .sort((a, b) => a - b);
}

function CheckpointPlanSelector({
  theme,
  recommendedCount,
  selectedCount,
  onCountChange,
  markerStyle,
  onMarkerStyleChange,
  readingCount,
  recommendationReason,
  isLoading = false,
}: CheckpointPlanSelectorProps) {
  const countOptions = getCountOptions(recommendedCount);
  const SelectedMarkerIcon = markerOptions.find((option) => option.value === markerStyle)?.icon ?? DiamondRoundedIcon;
  const previewCount = Math.min(selectedCount, previewLabels.length);
  const markerColor = getMarkerColor(markerStyle, theme);

  return (
    <Box sx={{ mx: 2, mt: 3, display: "flex", flexDirection: "column", gap: 2.25 }}>

      <Box>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
          {isLoading ? "Preparing your checkpoint plan." : "Your checkpoint plan is ready."}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {isLoading
            ? "The AI is reviewing the reading structure and ASRS profile."
            : "You can keep the recommended plan or make one small change before starting."}
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: "secondary.main",
          borderRadius: 3,
          p: 2,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: theme.gradient,
            color: "#fff",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          AI
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {isLoading
              ? "I am preparing a checkpoint recommendation."
              : `For these readings, I recommend ${recommendedCount} checkpoints at natural topic breaks.`}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            {isLoading
              ? "This usually takes a few seconds."
              : recommendationReason ?? "Based on the text length, structure, and your ASRS profile."}
          </Typography>
        </Box>
      </Box>

      {!isLoading ? (
        <>

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
          Number of checkpoints
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1 }}>
          {countOptions.map((count) => {
            const selected = selectedCount === count;
            return (
              <Button
                key={count}
                variant="outlined"
                onClick={() => onCountChange(count)}
                sx={{
                  minHeight: 72,
                  borderRadius: 2,
                  borderColor: selected ? theme.accent : "action.disabled",
                  color: selected ? theme.accent : "text.secondary",
                  bgcolor: selected ? "background.paper" : "rgba(255,255,255,0.72)",
                  boxShadow: selected ? `0 0 0 2px ${theme.soft}` : "none",
                  textTransform: "none",
                  display: "flex",
                  flexDirection: "column",
                  fontWeight: 700,
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: "1.25rem" }}>{count}</Typography>
                <Typography variant="caption">checkpoints</Typography>
              </Button>
            );
          })}
        </Box>
        <Typography variant="caption" sx={{ mt: 0.75, color: "text.secondary", display: "block" }}>
          {recommendedCount} checkpoints recommended for {readingCount} readings.
        </Typography>
      </Box>

      <Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "210px 1fr" },
            gap: 1.25,
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Marker style
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              (optional)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            {markerOptions.map(({ value, label, icon: Icon }) => {
              const selected = markerStyle === value;
              const optionColor = getMarkerColor(value, theme);
              return (
                <Button
                  key={value}
                  variant="outlined"
                  onClick={() => onMarkerStyleChange(value)}
                  startIcon={<Icon sx={{ color: optionColor }} />}
                  sx={{
                    minWidth: 130,
                    borderRadius: 2,
                    borderColor: selected ? alpha(optionColor, 0.75) : "action.disabled",
                    color: selected ? "text.primary" : "text.primary",
                    bgcolor: selected ? "background.paper" : "rgba(255,255,255,0.72)",
                    boxShadow: selected ? `0 0 0 2px ${alpha(optionColor, 0.16)}` : "none",
                    textTransform: "none",
                    fontWeight: 700,
                    position: "relative",
                  }}
                >
                  {label}
                  {selected ? (
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 7,
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        bgcolor: optionColor,
                        color: "#fff",
                        fontSize: "0.6rem",
                        lineHeight: "15px",
                      }}
                    >
                      ✓
                    </Box>
                  ) : null}
                </Button>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
          Preview
        </Typography>
        <Box
          sx={{
            border: `1px solid ${alpha(theme.accent, 0.18)}`,
            borderRadius: 2,
            p: { xs: 1.5, sm: 2 },
            bgcolor: "rgba(255,255,255,0.74)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: `repeat(${previewCount}, minmax(0, 1fr))`,
              alignItems: "center",
              columnGap: 1,
              px: 1.5,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 28,
                right: 28,
                top: 15,
                height: 2,
                bgcolor: alpha(markerColor, 0.26),
              },
            }}
          >
            {Array.from({ length: previewCount }, (_, index) => {
              const isStart = index === 0;
              return (
                <Box key={previewLabels[index]} sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                  <Box sx={{ color: isStart ? markerColor : alpha(markerColor, 0.58), height: 30 }}>
                    <SelectedMarkerIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                    {previewLabels[index]}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Typography variant="caption" sx={{ mt: 1, color: "text.secondary", display: "block" }}>
          Checkpoints are placed at natural topic boundaries to support focus and comprehension.
        </Typography>
      </Box>
        </>
      ) : null}
    </Box>
  );
}

export default CheckpointPlanSelector;
