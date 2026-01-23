import { Box, Typography } from '@mui/material';
import { Link } from "react-router-dom";
import ColorButton from '../components/ColorButton';
import introImage from '../assets/intro.png';
import experimentImage from '../assets/experiment.png';
import TextField from '@mui/material/TextField';
import { useState } from "react";

function Intro() {
  const [participantCode, setParticipantCode] = useState("");

  const normalizedCode = participantCode.trim().toUpperCase();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100%",
        gap: 1,
      }}>
      <Box sx={{
        bgcolor: "secondary.main",
        borderRadius: 3,
        p: 3,
        flex: 2,
        height: { xs: "auto", md: "100%" },
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}>
        <Box sx={{
          flex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "text.primary",
        }}>
          <img src={experimentImage} alt="App Logo" style={{ width: 35, height: "auto" }} />
          <Typography variant="h1" component="h1" sx={{ margin: 0 }}>
            Experiment on AI Gamification effect on motivation
          </Typography>
        </Box>
        <Box sx={{
          marginTop: { xs: 1, md: 2 },
          flex: 1,
          color: "text.primary",
          paddingRight: 4,
        }}>
          <Typography variant="body1">
            Join an interactive experiment exploring gamification in education.
            Participate in engaging learning activities designed with game
            elements like challenges and rewards. Help researchers understand
            how gamification impacts motivation, engagement, and learning
            outcomes.
          </Typography>
        </Box>
        <Box sx={{
          flex: 1,
          color: "text.secondary",
          fontSize: "0.8rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}>
          <Typography variant="caption" sx={{ margin: 0 }}>
            Michaela Freire Griffith | TIDE Research Group on Interactive and
            Distributed Technologies for Education
          </Typography>
        </Box>
        <Box sx={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}>
          <TextField
            required
            id="outlined-basic"
            label="Participant Code"
            variant="outlined"
            value={participantCode}
            onChange={(e) => { setParticipantCode(e.target.value) }}
            sx={{ marginRight: 2 }}
          />
            {participantCode ? (
              <Link to="/pre" state={{ participantCode: normalizedCode }}>
                <ColorButton
                  name="Start Experiment"
                  disabled={false}
                />
              </Link>
            ) : (
              <ColorButton
                name="Start Experiment"
                disabled
              />
            )}
        </Box>
      </Box>
      <Box sx={{
        backgroundImage: `url(${introImage})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        bgcolor: "secondary.main",
        borderRadius: 3,
        p: 3,
        flex: 1,
        height: { xs: "auto", md: "100%" },
      }}>
      </Box>
    </Box>
  )
}

export default Intro
