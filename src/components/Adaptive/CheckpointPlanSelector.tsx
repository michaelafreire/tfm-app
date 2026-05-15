import { Box, Button, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { AdaptiveTheme } from "../../experiment/adaptiveConfig";
import {
  companionOptions,
  normalizeCompanionStyle,
  type CompanionStyle,
  type MarkerStyle,
} from "./AdaptiveProgressBar";
import FocusCompanion from "./FocusCompanion";

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

function CheckpointPlanSelector({
  theme,
  selectedCount,
  markerStyle,
  onMarkerStyleChange,
}: CheckpointPlanSelectorProps) {
  const { t } = useTranslation();

  const selectedCompanion = normalizeCompanionStyle(markerStyle);
  const previewDots = Math.max(1, Math.min(5, selectedCount));

  return (
    <Box
      sx={{
        mx: "auto",
        mt: 3,
        width: "100%",
        maxWidth: 820,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "100%", textAlign: "left" }}>
        <Typography variant="body1" sx={{ fontWeight: 800 }}>
          {t("adaptive.chooseCompanion")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("adaptive.companionSubtitle")}
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          gap: 1.5,
        }}
      >
        {companionOptions.map((option) => {
          const selected = selectedCompanion === option.value;
          return (
            <Button
              key={option.value}
              variant="outlined"
              onClick={() => onMarkerStyleChange(option.value as CompanionStyle)}
              sx={{
                minHeight: 156,
                borderRadius: 2,
                borderColor: selected ? theme.accent : alpha("#262a2c", 0.12),
                bgcolor: selected ? alpha(theme.accent, 0.06) : "background.paper",
                boxShadow: selected ? `0 0 0 2px ${alpha(theme.accent, 0.1)}` : "0 8px 28px rgba(38,42,44,0.04)",
                textTransform: "none",
                color: "text.primary",
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
              <FocusCompanion style={option.value} size={70} />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {t(option.labelKey)}
              </Typography>
            </Button>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
        <Box sx={{ height: 1, bgcolor: alpha("#262a2c", 0.08), flex: 1 }} />
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
          {t("adaptive.previewFocusPath")}
        </Typography>
        <Box sx={{ height: 1, bgcolor: alpha("#262a2c", 0.08), flex: 1 }} />
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          border: `1px solid ${alpha(theme.accent, 0.12)}`,
          borderRadius: 2,
          p: 2,
          display: "grid",
          gridTemplateColumns: "1fr 74px",
          gap: 2,
          alignItems: "center",
          bgcolor: alpha(theme.accent, 0.04),
        }}
      >
        <Box sx={{ border: `1px solid ${alpha("#262a2c", 0.08)}`, borderRadius: 2, p: 2 }}>
          <Box sx={{ width: 110, height: 6, borderRadius: 999, bgcolor: alpha("#262a2c", 0.16), mb: 1.5 }} />
          {Array.from({ length: 7 }, (_, index) => (
            <Box
              key={`preview-line-${index}`}
              sx={{
                width: `${index % 3 === 0 ? 72 : index % 2 === 0 ? 88 : 100}%`,
                height: 4,
                borderRadius: 999,
                bgcolor: alpha("#262a2c", 0.08),
                mb: 1,
              }}
            />
          ))}
        </Box>
        <Box sx={{ position: "relative", height: 156, mx: "auto", width: 44 }}>
          <Box sx={{ position: "absolute", left: "50%", top: 8, bottom: 8, width: 2, bgcolor: alpha(theme.accent, 0.18), transform: "translateX(-50%)" }} />
          {Array.from({ length: previewDots }, (_, index) => (
            <Box
              key={`preview-dot-${index}`}
              sx={{
                position: "absolute",
                left: "50%",
                top: previewDots === 1 ? "50%" : `${(index / (previewDots - 1)) * 100}%`,
                width: 9,
                height: 9,
                borderRadius: "50%",
                bgcolor: index < 2 ? theme.accent : "background.paper",
                border: `2px solid ${index < 2 ? theme.accent : alpha("#262a2c", 0.16)}`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
          <Box sx={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%, -50%)" }}>
            <FocusCompanion style={selectedCompanion} size={34} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CheckpointPlanSelector;
