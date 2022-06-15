import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button, TextField, Grid, Box, Typography } from '@mui/material';
import axios from '../../../api/axios';
import { PASSWORD_RESET_URL } from '../../../api/endpoints';
import Loader from '../../../components/shared/Loader'
import AlertError from '../../../components/shared/AlertError';
import AlertSuccess from '../../../components/shared/AlertSuccess';
import Icons from '../../../styles/Icons';

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const search = useLocation().search;
  const tokenParam = new URLSearchParams(search).get('token');
  const emailParam = new URLSearchParams(search).get('email');

  // Remove errors if user types in input fields
  useEffect(() => {
    setError(false);
    setErrorMessage("");
    setSuccess(false);
    setSuccessMessage("");
  }, [password, confirmPassword])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setErrorMessage("");

    if(password !== confirmPassword) {
      setLoading(false);
      setError(true);
      setErrorMessage("Lösenorden matchar inte.");
    }
    else {
      try {
        await axios.post(
          PASSWORD_RESET_URL, 
          JSON.stringify({
            password: password, 
            confirmPassword: confirmPassword,
            email: emailParam,
            token: tokenParam
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          })
        
        setLoading(false);
        setSuccess(true);
        setSuccessMessage("Ditt lösenord är nu uppdaterat.");
      } 
      catch(err) {
        setLoading(false);
        setError(true);
  
        if(!err.response) {
          setErrorMessage("Inget svar från servern, försök igen.");
        }
        else {
          setErrorMessage(err.response.data.Message);
        }
      }
    }
  };

  const closeErrorAlert = () => {
    setError(false);
  }

  const closeSuccessAlert = () => {
    setSuccess(false);
  }

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: 4,
        paddingRight: 4
      }}
    >
      <Typography component="h1" variant="h2">
        Ändra lösenord
      </Typography>
      <Box maxWidth={400} mt={2}>
        <Typography variant='body1'>
          Ange ett nytt lösenord.
        </Typography>
      </Box>
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
            <AlertSuccess success={success} closeSuccessAlert={closeSuccessAlert} successMessage={successMessage} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="password"
              label="Lösenord"
              name="password"
              autoComplete="off"
              type={"password"}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="confirmPassword"
              label="Bekräfta lösenord"
              name="confirmPassword"
              autoComplete="off"
              type={"password"}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? <Loader width={40} height={40} /> : "Spara"}
        </Button>
      </Box>
      <Typography>
        <Link 
          className="textLink" 
          to={"/login"}
          style={{ display: "flex", alignItems: "center" }}
        >
          Logga in&nbsp;<Icons.ArrowRightIcon />
        </Link>
      </Typography>
    </Box>
  );
}