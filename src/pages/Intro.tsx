import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import ColorButton from '../components/ColorButton';
import introImage from '../assets/intro.png';
import experimentImage from '../assets/experiment.png';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { readLocalSession, writeLocalSession } from "../hooks/useLocalDraft";
import { useTranslation } from "react-i18next";
import { languageOptions, type ExperimentLanguage } from "../i18n";
import type { ExperimentRouteState } from "../experiment/routeState";

const normalizeGroupNumber = (value: string) =>
  value.replace(/\s+/g, "").replace(/\D/g, "");

const isValidGroupNumber = (value: string) => ["1", "2", "3", "4"].includes(value);
const introControlWidth = { xs: "100%", lg: 220 };
const phasePath = {
  pre: "/pre",
  calibrationa: "/calibration",
  break: "/break",
  calibrationb: "/calibration",
  experiencea: "/experiencea",
  experienceb: "/experienceb",
  post: "/post",
};
const resumablePhases = ["post", "experienceb", "experiencea", "pre"] as const;

function getLocalDraftResumePhase(participantCode: string) {
  for (const phase of resumablePhases) {
    if (window.localStorage.getItem(`tfm-draft:${phase}:${participantCode}`)) {
      return phase;
    }
  }

  return null;
}

function Intro() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as ExperimentRouteState | null;
  const localSession = readLocalSession();
  const { t, i18n } = useTranslation();
  const [participantCode, setParticipantCode] = useState(
    routeState?.participantCode ?? ""
  );
  const [groupNumber, setGroupNumber] = useState(() =>
    normalizeGroupNumber(String(routeState?.groupNumber ?? ""))
  );
  const [language, setLanguage] = useState<ExperimentLanguage>(
    routeState?.language ?? localSession?.language ?? "en"
  );
  const normalizedCode = participantCode.trim().toUpperCase();
  const normalizedGroupNumber = normalizeGroupNumber(groupNumber);
  const hasGroupNumber = normalizedGroupNumber.length > 0;
  const groupNumberIsValid = isValidGroupNumber(normalizedGroupNumber);
  const canStartExperiment = normalizedCode.length > 0 && groupNumberIsValid && Boolean(language);

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [i18n, language]);

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
      alert(t("intro.groupNumberAlert"));
      return;
    }

    const { error } = await savePreResponses();
    if (error) {
      if (error.code === "23505") {
        const localSession = readLocalSession();
        const draftResumePhase = getLocalDraftResumePhase(normalizedCode);
        const canResumeLocalSession =
          localSession !== null &&
          localSession.participantCode === normalizedCode &&
          String(localSession.groupNumber) === normalizedGroupNumber;

        const resumePhase = canResumeLocalSession ? localSession.phase : draftResumePhase;

        if (resumePhase) {
          navigate(phasePath[resumePhase], {
            state: {
              participantCode: normalizedCode,
              groupNumber: Number(normalizedGroupNumber),
              language: localSession?.language ?? language,
              nextPath:
                resumePhase === "calibrationb"
                  ? "/experienceb"
                  : resumePhase === "calibrationa"
                    ? "/experiencea"
                    : undefined,
            },
          });
          return;
        }

        alert(t("intro.duplicateNoProgress"));
      } else {
        alert(t("intro.saveError"));
      }
      return;
    }
    writeLocalSession({
      participantCode: normalizedCode,
      groupNumber: Number(normalizedGroupNumber),
      language,
      phase: "pre",
    });
    navigate("/instructions", {
      state: {
        participantCode: normalizedCode,
        groupNumber: Number(normalizedGroupNumber),
        language,
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
            {t("intro.title")}
          </Typography>
        </Box>
        <Box sx={{
          marginTop: { xs: 1, md: 2 },
          flex: 1,
          color: "text.primary",
          paddingRight: 4,
        }}>
          <Typography variant="body1">
            {t("intro.welcome")}
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
            {t("intro.footer")}
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
                {t("intro.groupNumber")}
                <Box component="span" sx={{ color: "error.main", marginLeft: 0.5 }}>*</Box>
              </>
            )}
            variant="outlined"
            value={normalizedGroupNumber}
            onChange={(e) => handleGroupNumberChange(e.target.value)}
            error={hasGroupNumber && !groupNumberIsValid}
            helperText={hasGroupNumber && !groupNumberIsValid ? t("intro.groupNumberError") : ""}
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
                {t("intro.participantCode")}
                <Box component="span" sx={{ color: "error.main", marginLeft: 0.5 }}>*</Box>
              </>
            )}
            variant="outlined"
            value={participantCode}
            onChange={(e) => setParticipantCode(e.target.value)}
            sx={{ width: introControlWidth }}
          />
          <FormControl size="small" sx={{ width: introControlWidth }}>
            <InputLabel id="language-select-label">
              {t("intro.experimentLanguage")}
            </InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label={t("intro.experimentLanguage")}
              onChange={(event) => setLanguage(event.target.value as ExperimentLanguage)}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flexShrink: 0, width: introControlWidth }}>
            {canStartExperiment ? (
              <ColorButton
                name={t("common.startExperiment")}
                disabled={false}
                onClick={handleNext}
                fullWidth
              />
            ) : (
              <ColorButton
                name={t("common.startExperiment")}
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
