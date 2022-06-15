import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink, useOutletContext } from 'react-router-dom';
import { Button, TextField, Grid, Box, Typography, Link } from '@mui/material';
import useAuth from '../../../context/useAuth';
import axios from '../../../api/axios';
import { ADMIN_LOGIN_URL } from '../../../api/endpoints';
import Loader from '../../../components/shared/Loader'
import AlertError from '../../../components/shared/AlertError';

export default function AdminLogin() {
  // Get setter from auth context
  const { setAuth } = useAuth();
  const [crumbs, setCrumbs] = useOutletContext();

  useEffect(() => {
    setCrumbs([
      {
        route: '/adminlogin',
        title: 'Login as admin'
      }
    ])
  }, []);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Remove errors if user types in input fields
  useEffect(() => {
    setError(false);
    setErrorMessage("");
  }, [username, password])

  // Handle form submit
  const handleSubmit = async (e) => {
    // Prevent the browser from executing default actions, 
    // like page reload on submit.
    e.preventDefault();

    setLoading(true);

    // Clear errors on submit.
    setError(false);
    setErrorMessage("");

    // Send request to the server with the base url + the login url.
    // Pass the username and password as a JSON string, and make sure they match the names on the server.
    // Also indicate that the request body format is JSON.
    try {
      const response = await axios.post(
        ADMIN_LOGIN_URL, 
        JSON.stringify({
          userName: username, 
          password: password
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        })
      
      // Set the prop value in the auth context to an object 
      // including the two tokens.
      setAuth(response.data)
      localStorage.setItem('authTokens', JSON.stringify(response.data));

      setLoading(false);
      
      // Redirect the user to the admin page.
      navigate(from, { replace: true });
    } 
    catch(err) {
      setLoading(false);
      setError(true);

      if(!err.response) {
        setErrorMessage("No response from server, try again later.");
      }
      else {
        setErrorMessage(err.response.data.Message);
      }
    }
  };

  const closeErrorAlert = () => {
    setError(false);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: 4,
        paddingRight: 4
      }}
    >
      <Typography component="h1" variant="h2">
        Login
      </Typography>
      <Typography component="h2" variant="h6">
        As admin
      </Typography>
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          mt: 2, 
          mb: 2,
          maxWidth: 400, 
          border: "1px solid rgba(0, 0, 0, .125)", 
          p: 2, 
          borderRadius: "16px"
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <AlertError error={error} closeErrorAlert={closeErrorAlert} errorMessage={errorMessage} />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
          size="large"
        >
          {loading ? <Loader width={40} height={40} /> : "Login"}
        </Button>
      </Box>
      <Typography variant='body1' sx={{fontSize: 12}}>
        Forgot your password?&nbsp;
        <Link 
          color='success'
          component={RouterLink} 
          to={'/password/forgot'}
          className="textLink"
          underline='none'
        >
          Reset password
        </Link>
      </Typography>
    </Box>
  );
}