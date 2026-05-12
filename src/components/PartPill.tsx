import { Box, Typography } from "@mui/material";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";

type PartPillProps = {
  label: string;
};

function PartPill({ label }: PartPillProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "action.disabled",
        borderRadius: 2,
        px: 1.5,
        py: 0.75,
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        color: "text.primary",
        whiteSpace: "nowrap",
      }}
    >
      <AssignmentOutlined sx={{ color: "primary.main", fontSize: 20 }} />
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default PartPill;
