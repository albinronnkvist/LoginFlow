import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, TextField, Grid, Box, Typography } from '@mui/material';
import axios from '../../../api/axios';
import { PASSWORD_FORGOT_URL } from '../../../api/endpoints';
import Loader from '../../../components/shared/Loader'
import AlertError from '../../../components/shared/AlertError';
import AlertSuccess from '../../../components/shared/AlertSuccess';
import Icons from '../../../styles/Icons';
import { BASE_URL, PASSWORD_RESET_URL } from '../../../helpers/UriHelpers';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Remove errors if user types in input fields
  useEffect(() => {
    setError(false);
    setErrorMessage("");
    setSuccess(false);
    setSuccessMessage("");
  }, [email])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setErrorMessage("");
    
    try {
      await axios.post(
        PASSWORD_FORGOT_URL, 
        JSON.stringify({
          email: email, 
          clientURI: BASE_URL + PASSWORD_RESET_URL
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        })
      
      setLoading(false);
      setSuccess(true);
      setSuccessMessage("Vi har skickat en länk för återställning till din e-postaddress, kolla din inkorg.");
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
        Återställ lösenord
      </Typography>
      <Box maxWidth={400} mt={2}>
        <Typography variant='body1'>
          Ange e-postadressen som är kopplat till ditt konto.
          <br />
          Så skickar vi en återställningslänk till dig.
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
              id="email"
              label="E-post"
              name="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
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
          {loading ? <Loader width={40} height={40} /> : "Återställ"}
        </Button>
      </Box>
      <Typography>
        <Link 
          className="textLink" 
          to={"/login"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Icons.ArrowLeftIcon /> &nbsp;Tillbaka till inloggning
        </Link>
      </Typography>
    </Box>
  );
}