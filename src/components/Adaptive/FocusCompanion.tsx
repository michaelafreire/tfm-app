import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getCompanionOption, type CompanionStyle } from "./AdaptiveProgressBar";

type FocusCompanionProps = {
  style: CompanionStyle;
  size?: number;
  active?: boolean;
  sleepy?: boolean;
};

function getShapeSx(shape: ReturnType<typeof getCompanionOption>["shape"]) {
  if (shape === "square") return { borderRadius: "28%" };
  if (shape === "bean") return { borderRadius: "56% 44% 58% 42%" };
  if (shape === "arch") return { borderRadius: "52% 52% 28% 28%" };
  return { borderRadius: "50%" };
}

function FocusCompanion({ style, size = 34, active = false, sleepy = false }: FocusCompanionProps) {
  const companion = getCompanionOption(style);
  const animation = active ? "companionReward 920ms ease-out" : sleepy ? "companionSleepy 2600ms ease-in-out infinite" : "none";

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        filter: active ? `drop-shadow(0 0 30px ${alpha(companion.color, 0.78)})` : "none",
        animation,
        transformOrigin: "50% 90%",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -size * 0.48,
          borderRadius: "50%",
          bgcolor: alpha(companion.color, active ? 0.36 : 0),
          transform: active ? "scale(1.62)" : "scale(0.58)",
          opacity: active ? 0 : 1,
          animation: active ? "companionHalo 920ms ease-out" : "none",
        },
        "@keyframes companionReward": {
          "0%": { transform: "translateY(0) scale(1, 1)" },
          "18%": { transform: "translateY(2px) scale(1.26, 0.72)" },
          "48%": { transform: "translateY(-10px) scale(0.78, 1.3)" },
          "72%": { transform: "translateY(1px) scale(1.13, 0.87)" },
          "100%": { transform: "translateY(0) scale(1, 1)" },
        },
        "@keyframes companionHalo": {
          "0%": { transform: "scale(0.42)", opacity: 0.78 },
          "68%": { transform: "scale(1.78)", opacity: 0.16 },
          "100%": { transform: "scale(2.16)", opacity: 0 },
        },
        "@keyframes companionSleepy": {
          "0%": { transform: "translateY(0) rotate(0deg) scale(1, 1)" },
          "45%": { transform: "translateY(4px) rotate(4deg) scale(1.03, 0.94)" },
          "100%": { transform: "translateY(0) rotate(0deg) scale(1, 1)" },
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: companion.color,
          boxShadow: `0 8px 18px ${alpha(companion.color, 0.2)}`,
          ...getShapeSx(companion.shape),
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "29%",
          top: "42%",
          width: "11%",
          height: "11%",
          borderRadius: "50%",
          borderBottom: `${Math.max(1.5, size * 0.055)}px solid #223`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: "29%",
          top: "42%",
          width: "11%",
          height: "11%",
          borderRadius: "50%",
          borderBottom: `${Math.max(1.5, size * 0.055)}px solid #223`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "28%",
          bottom: -2,
          width: "17%",
          height: "12%",
          borderRadius: "50%",
          bgcolor: alpha("#1f2933", 0.18),
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: "28%",
          bottom: -2,
          width: "17%",
          height: "12%",
          borderRadius: "50%",
          bgcolor: alpha("#1f2933", 0.18),
        }}
      />
      {sleepy ? (
        <Box
          sx={{
            position: "absolute",
            right: -size * 0.35,
            top: -size * 0.28,
            color: alpha("#6b7280", 0.48),
            fontSize: Math.max(11, size * 0.34),
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1,
            animation: "sleepyZ 2600ms ease-in-out infinite",
            "@keyframes sleepyZ": {
              "0%": { opacity: 0.22, transform: "translateY(1px)" },
              "45%": { opacity: 0.52, transform: "translateY(-2px)" },
              "100%": { opacity: 0.22, transform: "translateY(1px)" },
            },
          }}
        >
          zzz
        </Box>
      ) : null}
    </Box>
  );
}

export default FocusCompanion;
