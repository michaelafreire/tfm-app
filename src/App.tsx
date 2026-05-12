import './App.css'
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import Pre from "./pages/Pre";
import Calibration from "./pages/Calibration";
import ExperienceA from "./pages/ExperienceA";
import ExperienceB from "./pages/ExperienceB";
import Post from "./pages/Post";
import Final from "./pages/Final";
import Break from "./pages/Break";
import { Box } from '@mui/material';
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWebGazer } from "./hooks/useWebGazer";
import Instructions from './pages/Instructions';
import ExperienceIntro from './pages/ExperienceIntro';
import type { ExperimentRouteState } from './experiment/routeState';

function App() {
  useWebGazer();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isCalibrationRoute = location.pathname === "/calibration";
  const routeState = location.state as ExperimentRouteState | null;

  useEffect(() => {
    if (routeState?.language && i18n.language !== routeState.language) {
      void i18n.changeLanguage(routeState.language);
    }
  }, [i18n, routeState?.language]);

  return (
    <Box sx={{
      bgcolor: isCalibrationRoute ? "transparent" : "background.paper",
      borderRadius: isCalibrationRoute ? 0 : 3,
      p: isCalibrationRoute ? 0 : 1,
      height: isCalibrationRoute ? "100vh" : "90vh",
      width: isCalibrationRoute ? "100vw" : "90vw",
      boxShadow: isCalibrationRoute ? 0 : 3,
    }}>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/pre" element={<Pre />} />
        <Route path="/calibration" element={<Calibration />} />
        <Route path="/experience-intro" element={<ExperienceIntro />} />
        <Route path="/experiencea" element={<ExperienceA />} />
        <Route path="/experienceb" element={<ExperienceB />} />
        <Route path="/post" element={<Post />} />
        <Route path="/final" element={<Final />} />
        <Route path="/break" element={<Break />} />
        <Route path="/instructions" element={<Instructions />} />
      </Routes>
    </Box>
  )
}

export default App
