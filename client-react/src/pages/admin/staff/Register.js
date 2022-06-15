import { useEffect, useState, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Button, TextField, Grid, Box, Typography, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';
import axios from '../../../api/axios';
import useAuth from '../../../context/useAuth';
import { GET_ROLES_URL, REGISTER_USER_URL } from '../../../api/endpoints'
import AlertError from '../../../components/shared/AlertError';
import AlertSuccess from '../../../components/shared/AlertSuccess';
import Loader from '../../../components/shared/Loader';
import Icons from '../../../styles/Icons'

export default function Register() {
  const { auth } = useAuth();
  const [crumbs, setCrumbs] = useOutletContext();
  const alertRef = useRef();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [chosenRole, setChosenRole] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setCrumbs([
      {
        route: '/staff',
        title: 'Personal'
      },
      {
        route: '/register',
        title: 'Registrera ny'
      }
    ])

    getRoles();
  }, [])

  useEffect(() => {
    if(roles.length > 0) {
      setChosenRole(roles[0].normalizedName);
    }
  }, [roles])

  const getRoles = async () => {
    try {
      const response = await axios.get(
        GET_ROLES_URL,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}`  
          },
          withCredentials: true
        })

      setRoles(response.data);
    } 
    catch(err) {
      setError(true);

      if(!err.response) {
        setErrorMessage("Inget svar från servern, försök igen.");
      }
      else {
        setErrorMessage(err.response.data.Message);
      }
    }
  }

  const clearAll = () => {
    setFirstName("")
    setLastName("")
    setUserName("");
    setEmail("");
    setPassword("");
    setChosenRole(roles > 0 ? roles[0].name : "");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.post(
        REGISTER_USER_URL, 
        JSON.stringify({
          fullName: firstName + " " + lastName,
          userName: userName,
          password: password,
          email: email,
          phoneNumber: phoneNumber,
          roles: [ chosenRole ]
        }),
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}`  
          },
          withCredentials: true
        })
      
      setSuccess(true);
      setSuccessMessage("User was created!");
      setLoading(false);
    } 
    catch(err) {
      setLoading(false);
      setError(true);

      if(!err.response) {
        setErrorMessage("No response from server, try again later.");
      }
      else if(err.response.status === 422) {
        // ! Print errors better here
        setErrorMessage(err.response.data.Message)
      }
      else {
        setErrorMessage(err.response.data.Message);
      }
    }

    alertRef.current.scrollIntoView({ behavior: "smooth", block: 'center' });
  };

  const closeErrorAlert = () => {
    setError(false);
  }

  const closeSuccessAlert = () => {
    setSuccess(false);
  }

  return (
    <>
      <Typography variant="h3" mb={4}>
        Register new
      </Typography>
    
      <Box
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          mt: 2, 
          mb: 2,
          border: "1px solid rgba(0, 0, 0, .125)", 
          p: 2, 
          maxWidth: 600,
          borderRadius: "16px"
        }}
      >
        <div ref={alertRef}></div>
        <AlertError error={error} closeErrorAlert={closeErrorAlert} errorMessage={errorMessage} />
        <AlertSuccess success={success} closeSuccessAlert={closeSuccessAlert} successMessage={successMessage} />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="firstName"
              fullWidth
              id="firstName"
              label="Firstname"
              autoFocus
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="lastName"
              label="Lastname"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="phone"
              label="Phone"
              name="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={8} md={3}>
            <FormControl fullWidth>
              <InputLabel id="input-roles">Choose role</InputLabel>
              <Select
                labelId="select-roles"
                id="select-roles"
                value={chosenRole}
                label="Choose role"
                onChange={(e) => setChosenRole(e.target.value)}
              >
                {roles && roles.map((role, index) => (
                  <MenuItem key={index} value={role.normalizedName}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} mt={4} justifyContent={"end"}>
          <Button 
            variant="outlined" 
            color='primary'
            onClick={clearAll}>
            Clear
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="large"
          >
            {loading ? <Loader width={40} height={40} /> : "Register"}
          </Button>
        </Stack>
      </Box>
      <Typography>
        <Link 
          className="textLink" 
          to={"/admin/staff"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Icons.ArrowLeftIcon /> &nbsp;Back to staff
        </Link>
      </Typography>
    </>
  );
}