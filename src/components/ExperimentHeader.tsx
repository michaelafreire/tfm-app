import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import experimentImage from '../assets/experiment.png';

type ExperimentHeaderProps = {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
};

function ExperimentHeader({ title, children, action }: ExperimentHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: 'secondary.main',
        borderRadius: 3,
        p: { xs: 2.25, md: 2 },
        flex: '0 0 auto',
        minHeight: { xs: 170, md: 132 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        position: 'relative',
      }}
    >
      {action ? (
        <Box sx={{ position: 'absolute', top: { xs: 18, md: 20 }, right: { xs: 18, md: 20 } }}>
          {action}
        </Box>
      ) : null}
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
        <img src={experimentImage} alt="App Logo" style={{ width: 35, height: 'auto' }} />
        <Typography variant="body1" sx={{ marginTop: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
        {children}
      </Box>
    </Box>
  );
}

export default ExperimentHeader;
