import { Typography, Button } from '@mui/material';
import { useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import Icons from '../../styles/Icons';
import useAuth from '../../context/useAuth';
import useCustomerAuth from '../../context/useCustomerAuth';
import jwtDecode from 'jwt-decode';

export default function Home() {
  const { auth, setAuth } = useAuth();
  const { customerAuth, setCustomerAuth } = useCustomerAuth();
  const [crumbs, setCrumbs] = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    setCrumbs(null)
  }, []);

  const logOut = () => {
    setAuth(null)
    setCustomerAuth(null)
    localStorage.removeItem('authTokens')
    localStorage.removeItem('customerAuthTokens')
    navigate("/");
  }

  return (
    <>
      <Typography variant="h3" mb={4}>
        Start
      </Typography>

      {auth != null || customerAuth != null ? (
        <>
          {auth && (
            <Typography mb={2}>
              <b>Signed in as:</b>
              <br />
              {jwtDecode(auth.accessToken).username}
              <br />
              {jwtDecode(auth.accessToken).email}
            </Typography>
          )}

          {customerAuth && (
            <Typography mb={2}>
              <b>Signed in as:</b>
              <br />
              {jwtDecode(customerAuth.accessToken).username}
              <br />
              {jwtDecode(customerAuth.accessToken).email}
            </Typography>
          )}


          {auth && (
            <Typography mb={4}>
              <Link 
                className="textLink" 
                to={"/admin/dashboard"}
                style={{ display: "flex", alignItems: "center" }}
              >
                Go to admin layout&nbsp;<Icons.ArrowRightIcon />
              </Link>
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={logOut}
          >
            Sign out&nbsp;<Icons.SignOutIcon />
          </Button>
        </>
      ) : (
        <>
          <Typography>
            <Link 
              className="textLink" 
              to={"/customerlogin"}
              style={{ display: "flex", alignItems: "center" }}
            >
              Login as customer&nbsp;<Icons.ArrowRightIcon />
            </Link>
          </Typography>
          <Typography>
            <Link 
              className="textLink" 
              to={"/adminlogin"}
              style={{ display: "flex", alignItems: "center" }}
            >
              Login as admin&nbsp;<Icons.ArrowRightIcon />
            </Link>
          </Typography>
        </>
      )}
    </>
  );
}