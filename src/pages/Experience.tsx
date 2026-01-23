import { Box, Typography } from '@mui/material';
import { Link } from "react-router-dom";
import ColorButton from '../components/ColorButton';
import { useLocation } from "react-router-dom";

function Experience() {
  const location = useLocation();
  const participantCode = location.state?.participantCode;

  if (!participantCode) {
    return <div>Invalid access. Please restart the experiment.</div>;
  }

  return (
    <Box
      sx={{
        height: "100%",
        gap: 1,
      }}>
      <Box sx={{
        bgcolor: "secondary.paper",
        borderRadius: 3,
        p: 3,
        width: "100%",
        height: "100%",
      }}>
        <Box sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}>
          <Box sx={{
            flex: 4,
          }}>
            <Typography>Insert Experience Here</Typography>
          </Box>
          <Box sx={{
            flex: 1,
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}>
            <Link to="/post" state={{ participantCode }}>
              <ColorButton
                name="Next"
                disabled={false}
              />
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Experience
