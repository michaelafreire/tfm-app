import { Box, Button, Typography } from "@mui/material";

type AttentionProbeModalProps = {
  open: boolean;
  onSelect: (value: "task-focused" | "distracted by thoughts" | "other") => void;
};

const PROBE_OPTIONS: Array<"task-focused" | "distracted by thoughts" | "other"> = [
  "task-focused",
  "distracted by thoughts",
  "other",
];

function AttentionProbeModal({ open, onSelect }: AttentionProbeModalProps) {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(10, 18, 24, 0.36)",
        zIndex: 20,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 3,
          backgroundColor: "background.paper",
          p: 3,
          boxShadow: "0 20px 50px rgba(0,0,0,0.16)",
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
          Attention Check
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Just before this, were you:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {PROBE_OPTIONS.map((option) => (
            <Button
              key={option}
              variant="outlined"
              onClick={() => onSelect(option)}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                borderColor: "primary.main",
                color: "text.primary",
              }}
            >
              {option}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default AttentionProbeModal;
