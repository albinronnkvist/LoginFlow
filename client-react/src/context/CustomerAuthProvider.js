import { createContext, useState, useEffect } from "react";
import { Alert, Snackbar, IconButton } from "@mui/material";
import { CUSTOMER_REFRESH_URL } from "../api/endpoints";
import { ALERT_SEVERITY_ENUM } from "../helpers/DialogHelpers";
import { Close } from "@mui/icons-material";
import axios from "../api/axios";
import jwtDecode from "jwt-decode";

// Create a Context object
// When React renders a component that subscribes to this Context object 
// it will read the current context value from the closest matching Provider
const CustomerAuthContext = createContext({});

export const CustomerAuthProvider = ({ children }) => {
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState();
  const [alertSeverity, setAlertSeverity] = useState();
  
  // Get values from localStorage and update the auth state.
  // If there is no local storage item, the auth state is set to null (user not authenticated).
  let [customerAuth, setCustomerAuth] = useState(() => localStorage.getItem('customerAuthTokens') 
    ? JSON.parse(localStorage.getItem('customerAuthTokens')) 
    : null);
  let [initialLoad, setInitialLoad] = useState(true);

  const closeAlert = () => {
    setAlert(false);
    setAlertMessage("");
    setAlertSeverity(ALERT_SEVERITY_ENUM.INFO);
  }

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={closeAlert}
      >
        <Close />
      </IconButton>
    </>
  );

  // Call the refreshToken method on the initial load and every nine minutes
  // (the access token expires after 10 minutes) so it has to be refreshed. 
  useEffect(() => {

    // Refresh the tokens and update the state + localstorage with the new tokens.
    const refreshToken = async () => {
      setAlert(false);
      setAlertMessage("");

      // set initialLoad to false, since this method will be executed on first load.
      if(initialLoad) {
        setInitialLoad(false);
      }

      if(customerAuth) {
        try {
          const response = await axios.post(
            CUSTOMER_REFRESH_URL, 
            JSON.stringify({
              AccessToken: customerAuth?.accessToken,
              RefreshToken: customerAuth?.refreshToken
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              withCredentials: true
            })
          
          setCustomerAuth(response.data)
          localStorage.setItem('customerAuthTokens', JSON.stringify(response.data));
          
          // Informera om att en token håller på att gå ut (om 15min)
          let fifteenMinutes = 900000; // 15 min in ms
          if(jwtDecode(customerAuth.accessToken).refreshExpireAt === (Date.now() - fifteenMinutes)) {
            setAlert(true);
            setAlertMessage("Du kommer automatiskt loggas ut om 15 minuter. Logga in igen för att hindra detta.");
            setAlertSeverity(ALERT_SEVERITY_ENUM.WARNING);
          }
        } 
        catch {
          // If token is not valid: log out
          // If token is valid: inform about an issue
          if(jwtDecode(customerAuth.accessToken)?.refreshExpireAt <= Date.now()) {
            setAlert(true);
            setAlertMessage("Din session har gått ut, logga in igen för att fortsätta.");
            setAlertSeverity(ALERT_SEVERITY_ENUM.ERROR);
            setCustomerAuth(null);
            localStorage.removeItem('customerAuthTokens');
          }
          else {
            setAlert(true);
            setAlertMessage("Något gick snett vid autentisering, ladda om sidan eller logga in på nytt.");
            setAlertSeverity(ALERT_SEVERITY_ENUM.ERROR);
          }
        }
      }
    }

    // On inital load
    if(initialLoad) {
      refreshToken();
    }

    // Every nine minutes
    const nineMinutes = 1000 * 60 * 9;

    // The setInterval() method repeatedly calls a function with a fixed time delay between each call. 
    // This method returns an interval ID which uniquely identifies the interval, 
    // so it can be removed later by calling clearInterval(), which is necessary for preventing an infinite loop.
    const intervalId = setInterval(() => {
      if(customerAuth){
        refreshToken();
      }
    }, nineMinutes)

    return () => {clearInterval(intervalId)}

  }, [customerAuth, initialLoad])

  return (
    // the Provider allows consuming components to subscribe to context changes.
    // Pass the auth prop to consuming components that are descendants of this provider.
    // All consumers that are descendants of this provider will re-render whenever the providers prop changes.
    <>
      <Snackbar open={alert}>
        <Alert severity={alertSeverity} action={action}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <CustomerAuthContext.Provider value={{ customerAuth, setCustomerAuth, setAlert, setAlertMessage, setAlertSeverity }} >
        {initialLoad ? null : children}
      </CustomerAuthContext.Provider>
    </>
  )
}

export default CustomerAuthContext;