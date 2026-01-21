import { Typography } from "@mui/material"
import Avatar from '@mui/material/Avatar';
import { Box } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import theme from "../../theme/theme";
import { alpha } from '@mui/material/styles';

type ProgressBarIconProps = {
  id : string;
  label: string;
  isActive?: boolean;
  isCompleted?: boolean;
};

function ProgressBarIcon({ id, label, isActive, isCompleted }: ProgressBarIconProps) {
  const avatarText = isCompleted ? <CheckIcon />: id;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
      }}>
      <Avatar sx={{
        bgcolor: isCompleted
          ? "primary.main"
          : isActive
          ? alpha(theme.palette.primary.main, 0.5)
          : 'disabled.main',
        color: "background.paper",
      }}>
        {avatarText}
      </Avatar>
      <Typography sx={{ paddingTop: { xs: 1, md: 0 }, paddingLeft: { md: 2 } }}>{label}</Typography>
    </Box>
  )
}

export default ProgressBarIcon
