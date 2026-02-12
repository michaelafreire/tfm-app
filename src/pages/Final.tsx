import { Box, Typography } from '@mui/material';
import finalImage from '../assets/final.png';

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
        <img src={finalImage} style={{ width: 250, height: 250 }} />
        <Typography variant="body2" align='center'>
          <span style={{ display: 'inline-block', fontWeight: "bold", color: "#3ba195", marginBottom: 4, fontSize: 15 }}>Thank you for participating!</span><br />
          Your time and contribution are greatly appreciated.
        </Typography>
      </Box>
    </Box>
  )
}

export default Final
