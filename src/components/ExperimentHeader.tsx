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
        p: 3,
        flex: 1,
        height: { xs: 'auto', md: '100%' },
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
        <img src={experimentImage} alt="App Logo" style={{ width: 35, height: 'auto' }} />
        <Typography variant="body1" sx={{ marginTop: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
        {children}
      </Box>
      {action}
    </Box>
  );
}

export default ExperimentHeader;
