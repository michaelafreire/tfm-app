import { Box, Typography } from '@mui/material';
import ColorButton from '../components/ColorButton';
import introImage from '../assets/intro.png';
import experimentImage from '../assets/experiment.png';
import TextField from '@mui/material/TextField';
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const normalizeGroupNumber = (value: string) =>
  value.replace(/\s+/g, "").replace(/\D/g, "");

const isValidGroupNumber = (value: string) => ["1", "2", "3", "4"].includes(value);
const introControlWidth = { xs: "100%", lg: 220 };

function Intro() {
  const navigate = useNavigate();
  const location = useLocation();
  const [participantCode, setParticipantCode] = useState(
    location.state?.participantCode ?? ""
  );
  const [groupNumber, setGroupNumber] = useState(() =>
    normalizeGroupNumber(String(location.state?.groupNumber ?? ""))
  );
  const normalizedCode = participantCode.trim().toUpperCase();
  const normalizedGroupNumber = normalizeGroupNumber(groupNumber);
  const hasGroupNumber = normalizedGroupNumber.length > 0;
  const groupNumberIsValid = isValidGroupNumber(normalizedGroupNumber);
  const canStartExperiment = normalizedCode.length > 0 && groupNumberIsValid;

  async function savePreResponses() {
    return supabase.from("responses").insert([
      {
        participant_code: normalizedCode,
        phase: "login",
        group_number: normalizedGroupNumber,
      }
    ]);
  }

  const handleGroupNumberChange = (value: string) => {
    const nextGroupNumber = normalizeGroupNumber(value);
    if (nextGroupNumber === "" || isValidGroupNumber(nextGroupNumber)) {
      setGroupNumber(nextGroupNumber);
    }
  };

  const handleNext = async () => {
    if (!groupNumberIsValid) {
      alert("Please enter a group number between 1 and 4.");
      return;
    }

    const { error } = await savePreResponses();
    if (error) {
      if (error.code === "23505") {
        alert("This participant code has been used.");
      } else {
        alert("There was a problem saving your answers. Please contact the researcher.");
      }
      return;
    }
    navigate("/pre", {
      state: {
        participantCode: normalizedCode,
        groupNumber: Number(normalizedGroupNumber),
      },
    });
  };

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
            AI for Reading Comprehension
          </Typography>
        </Box>
        <Box sx={{
          marginTop: { xs: 1, md: 2 },
          flex: 1,
          color: "text.primary",
          paddingRight: 4,
        }}>
          <Typography variant="body1">
            Welcome to the experiment! In this study, we are exploring the use of AI in reading comprehension. You will be asked to read passages and answer some questions about them. The experiment will take approximately 1 hour to complete. Please make sure to enter your group number and participant code before starting the experiment.
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
          alignItems: "flex-start",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          marginTop: { xs: 2, md: 4 },
        }}>
          <TextField
            size="small"
            id="outlined-basic"
            label={(
              <>
                Group Number
                <Box component="span" sx={{ color: "error.main", marginLeft: 0.5 }}>*</Box>
              </>
            )}
            variant="outlined"
            value={normalizedGroupNumber}
            onChange={(e) => handleGroupNumberChange(e.target.value)}
            error={hasGroupNumber && !groupNumberIsValid}
            helperText={hasGroupNumber && !groupNumberIsValid ? "Enter a number from 1 to 4." : ""}
            inputProps={{ inputMode: "numeric", pattern: "[1-4]", maxLength: 1 }}
            sx={{
              width: introControlWidth,
              "& .MuiFormHelperText-root": {
                position: { lg: "absolute" },
                top: { lg: "100%" },
                left: 0,
                marginTop: 0.5,
                marginLeft: 0,
              },
            }}
          />
          <TextField
            size="small"
            id="outlined-basic"
            label={(
              <>
                Participant Code
                <Box component="span" sx={{ color: "error.main", marginLeft: 0.5 }}>*</Box>
              </>
            )}
            variant="outlined"
            value={participantCode}
            onChange={(e) => setParticipantCode(e.target.value)}
            sx={{ width: introControlWidth }}
          />
          <Box sx={{ flexShrink: 0, width: introControlWidth }}>
            {canStartExperiment ? (
              <ColorButton
                name="Start Experiment"
                disabled={false}
                onClick={handleNext}
                fullWidth
              />
            ) : (
              <ColorButton
                name="Start Experiment"
                disabled
                fullWidth
              />
            )}
          </Box>
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
