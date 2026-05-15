import {
  AssignmentTurnedInOutlined,
  HelpOutlineOutlined,
  MenuBookOutlined,
  MyLocationOutlined,
  PortraitOutlined,
  TimerOutlined,
} from "@mui/icons-material";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import { Box, Button, Typography } from "@mui/material";
import PanToolIcon from "@mui/icons-material/PanTool";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ExperimentRouteState } from "../experiment/routeState";
import ExperimentHeader from "../components/ExperimentHeader";

type FlowModuleProps = {
  title: string;
  icon: ReactNode;
  children?: ReactNode;
  variant?: "plain" | "highlight";
};

function FlowModule({ title, icon, children, variant = "plain" }: FlowModuleProps) {
  const highlighted = variant === "highlight";

  return (
    <Box
      sx={{
        bgcolor: highlighted ? "secondary.main" : "background.paper",
        border: 1,
        borderColor: highlighted ? "primary.main" : "action.disabled",
        borderRadius: 2,
        p: 1.25,
        minWidth: 0,
        flex: highlighted ? 1.35 : 1,
        minHeight: 96,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.75,
        textAlign: "center",
      }}
    >
      {icon}
      <Typography sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2, fontSize: "0.75rem" }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function ArrowConnector() {
  return (
    <Box
      sx={{
        color: "primary.main",
        fontWeight: 700,
        fontSize: "1.1rem",
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
      <MenuBookOutlined sx={{ color: "primary.main", fontSize: 30 }} />
      <Box component="span" sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.875rem" }}>
        +
      </Box>
      <HelpOutlineOutlined sx={{ color: "primary.main", fontSize: 30 }} />
      <Box
        sx={{
          position: "absolute",
          top: -5,
          left: "100%",
          transform: "translateX(-50%)",
          bgcolor: "primary.main",
          color: "background.paper",
          borderRadius: "999px",
          minWidth: 32,
          height: 24,
          px: 0.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          fontWeight: 700,
          boxShadow: 1,
        }}
      >
        x2
      </Box>
    </Box>
  );
}

function ExperienceFlow({ title, description }: { title: string; description: string }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flex: 1,
        minWidth: 0,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(116px, 1fr) auto minmax(160px, 1.35fr) auto minmax(116px, 1fr)",
          },
          gap: 1,
          alignItems: "stretch",
        }}
      >
        <FlowModule
          title={t("instructions.calibrate")}
          icon={<MyLocationOutlined sx={{ color: "primary.main", fontSize: 31 }} />}
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
          icon={<AssignmentTurnedInOutlined sx={{ color: "primary.main", fontSize: 31 }} />}
        />
      </Box>
      <Typography variant="body2" sx={{ marginTop: 0.5 }}>
        {description}
      </Typography>
    </Box>
  );
}

type InstructionRowProps = {
  label: string;
  subLabel?: string;
  children: ReactNode;
  compact?: boolean;
};

function InstructionRow({ label, subLabel, children, compact = false }: InstructionRowProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "action.disabled",
        borderRadius: 2,
        bgcolor: "background.paper",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "112px 1fr" },
        overflow: "hidden",
        flexShrink: 0,
        minHeight: compact ? 82 : 205,
      }}
    >
      <Box
        sx={{
          bgcolor: "secondary.main",
          borderRight: { xs: 0, md: "1px solid" },
          borderBottom: { xs: "1px solid", md: 0 },
          borderColor: "action.disabled",
          p: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            border: 1,
            borderColor: "action.disabled",
            borderRadius: 2,
            color: "primary.main",
            fontWeight: 700,
            px: 1.5,
            py: 0.75,
            minWidth: 72,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          {subLabel ? (
            <Typography sx={{ color: "text.primary", fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.2, mt: 0.25 }}>
              {subLabel}
            </Typography>
          ) : null}
        </Box>
      </Box>
      <Box
        sx={{
          p: compact ? 1.5 : 2,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          minHeight: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function Instructions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const routeState = (location.state as ExperimentRouteState | null) ?? {};

  const handleStart = () => {
    navigate("/pre", { state: routeState });
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
      <ExperimentHeader title={t("instructions.title")}>
        <Typography variant="body2" sx={{ maxWidth: 900, mt: 1 }}>
          {t("instructions.intro")}
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
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "background.default",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            scrollbarWidth: "thin",
            scrollbarColor: "#d1f2ea transparent",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
              {t("instructions.whatWillYouDo")}
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 900, mt: 1 }}>
              {t("instructions.fourParts")}
            </Typography>
          </Box>

          <InstructionRow label={t("part.one").replace("/4", "")} compact subLabel="(5 min)">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {t("instructions.preTitle")}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.35, marginTop: 0.5 }}>
                  {t("instructions.preDescription")}
                </Typography>
              </Box>
            </Box>
          </InstructionRow>

          <InstructionRow label={t("part.two").replace("/4", "")} subLabel="(15 min)">
            <ExperienceFlow
              title={t("instructions.experienceATitle")}
              description={t("instructions.experienceADescription")}
            />
          </InstructionRow>

          <InstructionRow label={t("instructions.breakLabel")} compact>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TimerOutlined sx={{ color: "primary.main", fontSize: 31 }} />
              <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
                {t("instructions.breakTitle")}
              </Typography>
            </Box>
          </InstructionRow>

          <InstructionRow label={t("part.three").replace("/4", "")} subLabel="(15 min)">
            <ExperienceFlow
              title={t("instructions.experienceBTitle")}
              description={t("instructions.experienceBDescription")}
            />
          </InstructionRow>

          <InstructionRow label={t("part.four").replace("/4", "")} compact subLabel="(2 min)">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {t("instructions.postTitle")}
                </Typography>
                <Typography variant="body2" sx={{ marginTop: 0.5 }}>
                  {t("instructions.postDescription")}
                </Typography>
              </Box>
            </Box>
          </InstructionRow>

          <Box
            sx={{
              bgcolor: "secondary.main",
              borderRadius: 2,
              border: 1,
              borderColor: "action.disabled",
              flexShrink: 0,
              p: 5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.55fr repeat(3, 1fr)" },
              gap: 1.25,
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AssignmentTurnedInOutlined sx={{ color: "primary.main", fontSize: 30 }} />
              <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
                {t("instructions.important")}
              </Typography>
            </Box>
            {[
              {
                text: t("instructions.keepHeadStill"),
                icon: PortraitOutlined,
              },
              {
                text: t("instructions.stopResearcher"),
                icon: PanToolIcon,
              },
              {
                text: t("instructions.cannotGoBack"),
                icon: AnnouncementIcon,
              },
            ].map(({ text, icon: ImportantIcon }) => (
              <Box key={text} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                <ImportantIcon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0, mt: 0.1 }} />
                <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.25 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            flexShrink: 0,
            pt: 2,
          }}
        >
          <Button variant="contained" color="primary" onClick={handleStart}>
            {t("common.startExperiment")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Instructions;
