import './App.css'
import { Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import Pre from "./pages/Pre";
import Calibration from "./pages/Calibration";
import ExperienceA from "./pages/ExperienceA";
import ExperienceB from "./pages/ExperienceB";
import Post from "./pages/Post";
import Final from "./pages/Final";
import { Box } from '@mui/material';
import { useLocation } from "react-router-dom";
import { useWebGazer } from "./hooks/useWebGazer";

function App() {
  useWebGazer();
  const location = useLocation();
  const isCalibrationRoute = location.pathname === "/calibration";

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
        <Route path="/experiencea" element={<ExperienceA />} />
        <Route path="/experienceb" element={<ExperienceB />} />
        <Route path="/post" element={<Post />} />
        <Route path="/final" element={<Final />} />
      </Routes>
    </Box>
  )
}

export default App
