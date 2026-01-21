import { Box, Typography } from '@mui/material';
// import thankYouImage from '../assets/thank_you.png';
import experimentImage from '../assets/experiment.png';

function Final() {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <img src={experimentImage} style={{ width: 200, height: 200 }} />
        <Typography variant="body2">
          Thank you text.
        </Typography>
      </Box>
    </Box>
  )
}

export default Final
