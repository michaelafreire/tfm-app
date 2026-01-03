import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3ba195", // Accent
    },
    secondary: {
      main: "#f0fafa",
    },
    background: {
      default: "#d1f2ea", // App background
      paper: "#fdffff",   // Cards / surfaces
    },
    text: {
      primary: "#262a2c",
      secondary: "#777774ff",
      disabled: "#dee4e4",
    },
    action: {
      disabled: "#dee4e4",
      disabledBackground: "#dee4e4",
    },
  },

  typography: {
    fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h1: {
      fontWeight: "bold",
      fontSize: '3rem', // default for desktop
      // adjust for tablets
      [`@media (max-width:960px)`]: {
        fontSize: '2rem',
      },
      // adjust for mobile
      [`@media (max-width:600px)`]: {
        fontSize: '1.5rem',
      },
    },
    body1: {
      fontSize: '1rem', // default for desktop
      [`@media (max-width:960px)`]: {
        fontSize: '0.9rem',
      },
      [`@media (max-width:600px)`]: {
        fontSize: '0.85rem',
      },
    },
  },
});

export default theme;
