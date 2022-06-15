import { ThemeProvider, createTheme } from '@mui/material/styles';
import { svSE } from '@mui/material/locale';

export default function ThemeConfig({ children }) {
  
  const theme = createTheme({
    palette: {
      primary: {
        main: '#001a3b',
        light: '#002759',
        dark: '#001127'
      },
      secondary: {
        main: '#f7f7f7',
        light: '#fff',
        dark: '#f2f2f2'
      },
      success: {
        main: "#16c090"
      },
      grey: {
        main: '#7d7d7d'
      },
      green: {
        main: '#16c090',
        light: '#65fed4',
        dark: '#107357'
      },
      pink: {
        main: '#ffd2da'
      }
    },
    typography: {
      fontFamily: [ 'Roboto', 'Raleway' ].join(','),
      h1: {
        fontFamily: 'Raleway',
        color: '#001a3b',
        fontWeight: 'bold'
      },
      h2: {
        fontFamily: 'Raleway',
        color: '#001a3b',
        fontWeight: 'bold'
      },
      h3: {
        fontFamily: 'Raleway',
        color: '#001a3b',
        fontWeight: 'bold'
      },
      h4: {
        fontFamily: 'Raleway',
        color: '#001a3b',
        fontWeight: 'bold'
      },
      h5: {
        fontFamily: 'Raleway',
        color: '#001a3b',
        fontWeight: 'bold'
      },
      h6: {
        fontFamily: 'Raleway',
        color: '#001a3b',
        fontWeight: 'bold'
      },
      subtitle1: {
        fontFamily: 'Raleway',
        color: '#001a3b'
      },
      subtitle2: {
        fontFamily: 'Raleway',
        color: '#001a3b'
      },
      body1: {
        fontFamily: 'Roboto',
        color: '#001a3b'
      },
      body2: {
        fontFamily: 'Roboto',
        color: '#001a3b'
      }
    },
    svSE
  })

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};