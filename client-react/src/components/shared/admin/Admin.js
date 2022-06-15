
import { useState } from 'react';
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { CssBaseline, Container, Box } from '@mui/material';
import useAuth from "../../../context/useAuth";
import jwtDecode from 'jwt-decode';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs'
import Footer from './Footer';

export default function Admin({ allowedRoles }) {
  const { auth } = useAuth();
  const location = useLocation();

  const [crumbs, setCrumbs] = useState();
  // This layout acts as a protected route, all child components 
  // of this component have to pass some checks:
  // 1. check if the auth state exists (if the user is authenticated). 
  //    If it doesn't exist: redirect to login.
  // 2. check if the accessToken contains any role claims and if the
  //    role claims matches one of the allowed roles. 
  //    If it does: user gets access - return the layout with the child component in the outlet.
  //    If it doesn't: user does not get access.
  // 3. check if the user has an access token
  //    If it does: return unauthorized page (user is logged in but not authorized to access the page)
  //    If it doesn't: redirect to login (user is not logged in)
  return (
    auth
      ?
        jwtDecode(auth.accessToken)?.roles?.find(role => allowedRoles?.includes(role))
          ?
            <Box sx={{ display: 'flex' }}>
              <CssBaseline />
              <Header />
              <Box component="main" sx={{ flexGrow: 1, px: { xs: 1, md: 3 }, py: { xs: 4, md: 3 }, mt: { xs: 6, md: 8 } }}>
                <Breadcrumbs breadcrumbs={crumbs} />
                <Container disableGutters maxWidth={false} sx={{ minHeight: '100vh', maxWidth: "100vw" }}>
                  <Outlet context={[crumbs, setCrumbs]} />
                </Container>
                <Footer />
              </Box>
            </Box>
          : auth?.accessToken
            ? 
              <Navigate to="/unauthorized" state={{ from: location }} replace />
            : 
              <Navigate to="/login" state={{ from: location }} replace />
      : 
        <Navigate to="/login" state={{ from: location }} replace />
  );
}