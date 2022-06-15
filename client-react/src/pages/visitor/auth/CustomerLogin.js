import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, } from '@mui/material';
import Login from '../../../components/shared/Login';

export default function CustomerLogin() {
  const [crumbs, setCrumbs] = useOutletContext();

  useEffect(() => {
    setCrumbs([
      {
        route: '/customerlogin',
        title: 'Login as customer'
      }
    ])
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: {xs: 0, md: 4},
        paddingRight: {xs: 0, md: 4}
      }}
    >
      <Typography component="h1" variant="h2">
        Login
      </Typography>
      <Typography component="h2" variant="h6">
        As customer
      </Typography>
      <Login path={"/"} />
    </Box>
  );
}