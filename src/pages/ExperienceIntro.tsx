import {
  AssignmentTurnedInOutlined,
  HelpOutlineOutlined,
  MenuBookOutlined,
  MyLocationOutlined,
} from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ExperimentHeader from "../components/ExperimentHeader";
import PartPill from "../components/PartPill";
import type { ExperimentRouteState } from "../experiment/routeState";

function ArrowConnector() {
  return (
    <Box
      sx={{
        color: "primary.main",
        fontWeight: 700,
        fontSize: "1rem",
        alignSelf: "center",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      →
    </Box>
  );
}

function ReadingRoundIcon() {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 0.75, px: 0.5 }}>
      <MenuBookOutlined sx={{ color: "primary.main", fontSize: 34 }} />
      <Box component="span" sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.875rem" }}>
        +
      </Box>
      <HelpOutlineOutlined sx={{ color: "primary.main", fontSize: 34 }} />
      <Box
        sx={{
          position: "absolute",
          top: -8,
          right: -18,
          bgcolor: "primary.main",
          color: "background.paper",
          borderRadius: "999px",
          minWidth: 30,
          height: 24,
          px: 0.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8rem",
          fontWeight: 700,
          boxShadow: 1,
        }}
      >
        x3
      </Box>
    </Box>
  );
}

type FlowModuleProps = {
  title: string;
  icon: React.ReactNode;
  highlight?: boolean;
};

function FlowModule({ title, icon, highlight = false }: FlowModuleProps) {
  return (
    <Box
      sx={{
        bgcolor: highlight ? "secondary.main" : "background.paper",
        border: 1,
        borderColor: highlight ? "primary.main" : "action.disabled",
        borderRadius: 2,
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        textAlign: "center",
        px: 2,
      }}
    >
      {icon}
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.2 }}>
        {title}
      </Typography>
    </Box>
  );
}

function ExperienceIntro() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const routeState = (location.state as ExperimentRouteState | null) ?? {};
  const experience = routeState.introExperience === "B" ? "B" : "A";
  const partLabel = experience === "B" ? t("part.three") : t("part.two");
  const nextPath = experience === "B" ? "/experienceb" : "/experiencea";
  const title = experience === "B" ? t("experienceIntro.titleB") : t("experienceIntro.titleA");

  const handleStart = () => {
    navigate("/calibration", {
      state: {
        ...routeState,
        nextPath,
        calibrationExperience: experience,
      },
    });
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        color: "text.primary",
      }}
    >
      <ExperimentHeader
        title={title}
        action={<PartPill label={partLabel} />}
      >
        <Typography variant="body2" sx={{ maxWidth: 900, mt: 1 }}>
          {experience === "B" ? t("experienceIntro.introB") : t("experienceIntro.introA")}
        </Typography>
      </ExperimentHeader>

      <Box
        sx={{
          bgcolor: "secondary.paper",
          borderRadius: 3,
          p: 3,
          flex: 3,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: "secondary.main",
            borderRadius: 2,
            border: 1,
            borderColor: "action.disabled",
            p: { xs: 2, md: 4 },
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(160px, 1fr) auto minmax(220px, 1.35fr) auto minmax(160px, 1fr)",
            },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <FlowModule
            title={t("instructions.calibrate")}
            icon={<MyLocationOutlined sx={{ color: "primary.main", fontSize: 34 }} />}
          />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <ArrowConnector />
          </Box>
          <FlowModule title={t("instructions.readingRounds")} icon={<ReadingRoundIcon />} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <ArrowConnector />
          </Box>
          <FlowModule
            title={t("instructions.experienceQuestionnaire")}
            icon={<AssignmentTurnedInOutlined sx={{ color: "primary.main", fontSize: 34 }} />}
          />
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            pt: 2,
          }}
        >
          <Button variant="contained" color="primary" onClick={handleStart}>
            {experience === "B" ? t("experienceIntro.startB") : t("experienceIntro.startA")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ExperienceIntro;
