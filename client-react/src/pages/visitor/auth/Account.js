import useCustomerAuth from "../../../context/useCustomerAuth";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Grid, TextField } from "@mui/material";
import axios from '../../../api/axios'
import jwtDecode from 'jwt-decode';
import { UPDATE_CUSTOMER_URL, GET_CUSTOMER_URL } from '../../../api/endpoints';
import Loader from '../../../components/shared/Loader';
import AlertError from '../../../components/shared/AlertError';
import AlertSuccess from '../../../components/shared/AlertSuccess';

export default function Account() {
  const { customerAuth } = useCustomerAuth();
  const [crumbs, setCrumbs] = useOutletContext();

  const [email, setEmail] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCrumbs([
      {
        route: '/account',
        title: 'Account'
      }
    ])

    const getCustomer = async () => {
      setLoading(true);
      setError(false);
      setErrorMessage("");
  
      try {
        const response = await axios.get(
          GET_CUSTOMER_URL + `${jwtDecode(customerAuth.accessToken)?.username}`, 
          {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${customerAuth.accessToken}`
            },
            withCredentials: true
          })

        setEmail(response.data.email);
        setPhone1(response.data.phone1);
        setPhone2(response.data.phone2);
        setLoading(false);
      } 
      catch(err) {
        setLoading(false);
        setError(true);
  
        if(!err.response) {
          setErrorMessage("Inget svar från servern, försök igen.");
        }
        else if(err.response.data.StatusCode === 500) {
          setErrorMessage("Internt serverfel, försök igen senare.")
        }
        else {
          setErrorMessage(err.response.data.Message);
        }
      }
    }

    getCustomer();
  }, []);

  const updateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.patch(
        UPDATE_CUSTOMER_URL + jwtDecode(customerAuth.accessToken)?.username, 
        [
          {
            "op": "replace",
            "path": '/email',
            "value": email
          },
          {
            "op": "replace",
            "path": '/phone1',
            "value": phone1
          },
          {
            "op": "replace",
            "path": '/phone2',
            "value": phone2
          }
        ],
        {
          headers: { 
            'Content-Type': 'application/json-patch+json',
            'Authorization': `Bearer ${customerAuth.accessToken}`
          },
          withCredentials: true
        })
      
      setSuccess(true);
      setSuccessMessage("Changes saved!");
      setLoading(false);
    } 
    catch (err) {
      setLoading(false);
      setError(true);

      if(!err.response) {
        setErrorMessage("No response from server, try again later.");
      }
      else {
        setErrorMessage(err.response.data.Message);
      }
    }
  }

  const closeErrorAlert = () => {
    setError(false);
  }

  const closeSuccessAlert = () => {
    setSuccess(false);
  }

  return (
    <>
      <Typography variant="h1" sx={{ textAlign: 'center', fontSize: { xs: 40, md: 75 } }} mb={4}>
        Account
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box sx={{ maxWidth: 600 }}>
          <Typography variant="body1" sx={{ textAlign: 'left' }} mb={4}>
            Manage your account
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box 
          component="form" 
          onSubmit={updateCustomer} 
          sx={{ 
            mb: 2,
            maxWidth: 600, 
            border: "1px solid rgba(0, 0, 0, .125)", 
            p: 2, 
            borderRadius: "16px"
          }}
        >
          <AlertError error={error} closeErrorAlert={closeErrorAlert} errorMessage={errorMessage} />
          <AlertSuccess success={success} closeSuccessAlert={closeSuccessAlert} successMessage={successMessage} />
          
          {/* Inseert */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                name="email"
                fullWidth
                id="email"
                label="Email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone1"
                fullWidth
                id="phone1"
                label="Phone 1"
                autoFocus
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone2"
                fullWidth
                id="phone2"
                label="Phone 2"
                autoFocus
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} mt={2} justifyContent={"end"}>
            <Button 
              variant='contained'
              type='submit'
              disabled={loading}
              sx={{ marginTop: 2 }}
            >
              {loading ? (
                <Loader width={40} height={40} />
              ) : (
                "Save"
              )}
            </Button>
          </Stack>
        </Box>
      </Box>
    </>
  )
}