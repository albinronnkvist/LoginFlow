import { useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import Icons from '../../styles/Icons';
import useAuth from '../../context/useAuth';
import jwtDecode from 'jwt-decode';

export default function Dashboard() {
  const { auth, setAuth } = useAuth();
  const [crumbs, setCrumbs] = useOutletContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    setCrumbs([
      {
        route: '/dashboard',
        title: 'Dashboard'
      }
    ])
  }, []);

  const logOut = () => {
    setAuth(null)
    localStorage.removeItem('authTokens')
    navigate("/");
  }

  return (
    <>
      <Typography variant="h3" mb={4}>
        Dashboard
      </Typography>
      
      <Typography mb={4}>
        <b>Signed in as:</b>
        <br />
        {jwtDecode(auth.accessToken).username}
        <br />
        {jwtDecode(auth.accessToken).email}
      </Typography>

      <Button
        variant="contained"
        onClick={logOut}
      >
        Sign out&nbsp;<Icons.SignOutIcon />
      </Button>
    </>
  );
}