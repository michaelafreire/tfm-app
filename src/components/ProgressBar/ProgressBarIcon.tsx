import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Box, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

type ProgressBarIconProps = {
  id: string;
  label: string;
  isActive?: boolean;
  isCompleted?: boolean;
  showLabel?: boolean;
  activeColor?: string;
};

function ProgressBarIcon({ id, label, isActive = false, isCompleted = false, showLabel = false, activeColor }: ProgressBarIconProps) {
  const filledColor = activeColor ?? "primary.main";

  return (
    <Tooltip title={label} arrow placement="top">
      <Box
        sx={{
          minWidth: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.75,
        }}
      >
        <Box
          sx={{
            width: isActive ? 30 : 26,
            height: isActive ? 30 : 26,
            borderRadius: "50%",
            bgcolor: isCompleted || isActive ? filledColor : "background.paper",
            border: isCompleted || isActive ? "none" : "1px solid",
            borderColor: "action.disabled",
            color: isCompleted || isActive ? "background.paper" : "text.secondary",
            boxShadow: isActive ? (theme) => `0 0 0 5px ${alpha(activeColor ?? theme.palette.primary.main, 0.12)}` : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            fontWeight: 800,
            transition: "all 180ms ease",
          }}
        >
          {isCompleted ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : id}
        </Box>
        {showLabel ? (
          <Typography
            variant="caption"
            sx={{
              color: filledColor,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {label}
          </Typography>
        ) : null}
      </Box>
    </Tooltip>
  );
}

export default ProgressBarIcon;
