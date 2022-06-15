import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Stepper, Step, StepLabel, StepContent, Button, Typography, TextField, Link } from '@mui/material';
import axios from '../../api/axios';
import { GET_TEMPORARY_CODE_URL, LOGIN_CUSTOMER_URL } from '../../api/endpoints';
import useCustomerAuth from '../../context/useCustomerAuth';
import Loader from './Loader';
import Countdown from 'react-countdown';
import AlertError from './AlertError';
import LoaderCentered from './LoaderCentered';

export default function Login({ usernameParam, path }) {
  const { setCustomerAuth, setAlert, setAlertMessage, setAlertSeverity } = useCustomerAuth();

  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingNewCode, setLoadingNewCode] = useState(false);
  const [threeMinutes, setThreeMinutes] = useState();
  const [currentMessage, setCurrentMessage] = useState();
  const [loginInfo, setLoginInfo] = useState(null);

  const [activeStep, setActiveStep] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || path;

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    if(usernameParam) {
      setUsername(usernameParam);
    }
  }, [])

  useEffect(() => {
    setError(false);
    setErrorMessage("");
  }, [username, code])
  

  const getTemporaryCode = async (isAskForNew) => {
    if(isAskForNew) {
      setLoading(true);
      setLoadingNewCode(true);
    }
    else {
      setLoading(true);
    }
    setError(false);
    setErrorMessage("");
    TempCodeLoadingLoop();

    try {
      const response = await axios.post(
        GET_TEMPORARY_CODE_URL, 
        JSON.stringify({
          userName: username
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        })

      setLoading(false);
      setLoadingNewCode(false);
      setThreeMinutes(Date.now() + 180000);
      setActiveStep(1);
      setLoginInfo(response.data)
    } 
    catch(err) {
      setLoading(false);
      setLoadingNewCode(false);
      setError(true);

      if(!err.response) {
        setErrorMessage("No response from server, try again later.");
      }
      else if(err.response.data.StatusCode === 500) {
        setErrorMessage("Internal server error, try again later.")
      }
      else {
        setErrorMessage(err.response.data.Message);
      }
    }
  }

  const loginCustomer = async () => {
    setLoading(true);
    setError(false);
    setErrorMessage("");

    try {
      const response = await axios.post(
        LOGIN_CUSTOMER_URL, 
        JSON.stringify({
          userName: username,
          tempCode: code
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        })
      
      setCustomerAuth(response.data);
      localStorage.setItem('customerAuthTokens', JSON.stringify(response.data));
      
      setLoading(false);
      setAlert(true);
      setAlertMessage("You are logged in");
      setAlertSeverity("success");
      navigate(from, { replace: true });
    } 
    catch(err) {
      setLoading(false);
      setError(true);

      if(!err.response) {
        setErrorMessage("No response from server, try again later.");
      }
      else if(err.response.data.StatusCode === 500) {
        setErrorMessage("Internal server error, try again later.")
      }
      else {
        setErrorMessage(err.response.data.Message);
      }
    }
  }

  const Completionist = () => {
    return (
      <span style={{ color: "red" }}>The code has expired and no longer works.</span>
    )
  }

  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      return <Completionist />;
    } else {
      return (
        <span>Code expires in: {minutes}:{seconds}</span>
      )
    }
  };

  const TempCodeLoadingLoop = async () => {
    const messages = [
      "Looking up username...",
      "Creating temporary code...",
      "Sending the temporary code to you..."
    ]

    for(let i = 0; i < messages.length; i++) {
      setCurrentMessage(messages[i]);
      await new Promise(res => { setTimeout(res, 600); });
    }
  }

  const closeErrorAlert = () => {
    setError(false);
  }

  return (
    <>
      <Box sx={{ minWidth: 350, maxWidth: 500, border: "1px solid rgba(0, 0, 0, .125)", p: 2, mt: 3, borderRadius: "16px" }}>
        <AlertError error={error} closeErrorAlert={closeErrorAlert} errorMessage={errorMessage} />
        <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>
                Enter your username
              </StepLabel>
              <StepContent>
                <Typography mb={2} mt={2}>
                  Enter your username and continue
                </Typography>
                <TextField 
                  id="username" 
                  variant="outlined" 
                  placeholder='Username123'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Box sx={{ mb: 2 }}>
                  <>
                    <Button
                      variant="contained"
                      onClick={getTemporaryCode}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={error || loading || username == null || username.length < 1 }
                    >
                      {loading ? <Loader width={40} height={40} /> : "Continue"}
                    </Button>
                    {loading && (
                      <Typography variant='body2' color='text.secondary' mt={2}>{currentMessage}</Typography>
                    )}
                  </>
                </Box>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>
                Enter code & login
              </StepLabel>
              <StepContent>
                {loadingNewCode ? (
                  <Box minWidth={400} mt={2}>
                    <LoaderCentered />
                    <Typography variant="body1" sx={{ textAlign: 'center' }} mt={2}>Sending new code...</Typography>
                  </Box>
                ) : (
                  <>
                    {loginInfo === null ? (
                      <Typography mb={2}>
                        We have sent you a temporary code via Email and / or SMS.
                      </Typography>
                    ) : (
                      <>
                        <Typography>
                          We have sent you a temporary code via Email and / or SMS.
                        </Typography>
                        <Typography mb={2} variant="body2" color="text.secondary" fontSize={14}>
                          {loginInfo.email && `${loginInfo.email}`}
                          <br />
                          {loginInfo.phone1 && `${loginInfo.phone1}`}
                          <br />
                          {loginInfo.phone2 && loginInfo.phone1 !== loginInfo.phone2 && `${loginInfo.phone2}`}
                        </Typography>
                        <Typography mb={2}>
                          Enter the code below and login                         
                        </Typography>
                      </>
                    )}
                    <TextField 
                      id="code" 
                      placeholder='Code'
                      variant='outlined' 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={loginCustomer}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={error || loading || code == null }
                        >
                          {loading ? <Loader width={40} height={40} /> : "Login"}
                        </Button>
                        <Button
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Tillbaka
                        </Button>
                      </div>
                    </Box>
                    <Typography variant='body1' sx={{fontSize: 12}} mt={2}>
                      <Countdown date={threeMinutes} renderer={renderer} />
                      <br />
                      Is the code not working?&nbsp;
                      <Link 
                        color='success'
                        className="textLink"
                        underline='none'
                        style={{ cursor: "pointer" }}
                        onClick={getTemporaryCode}
                      >
                        Ask for a new code
                      </Link>.
                    </Typography>
                  </>
                )}
              </StepContent>
            </Step>
        </Stepper>
      </Box>
    </>
  );
}