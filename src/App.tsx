import './App.css'
import { Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import Pre from "./pages/Pre";
import ExperienceA from "./pages/ExperienceA";
import ExperienceB from "./pages/ExperienceB";
import Post from "./pages/Post";
import Final from "./pages/Final";
import { Box } from '@mui/material';

function App() {

  return (
    <Box sx={{
      bgcolor: "background.paper",
      borderRadius: 3,
      p: 1,
      height: "90vh",
      width: "90vw",
      boxShadow: 3,
    }}>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/pre" element={<Pre />} />
        <Route path="/experiencea" element={<ExperienceA />} />
        <Route path="/experienceb" element={<ExperienceB />} />
        <Route path="/post" element={<Post />} />
        <Route path="/final" element={<Final />} />
      </Routes>
    </Box>
  )
}

export default App
