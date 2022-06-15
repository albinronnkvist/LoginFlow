import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Typography } from '@mui/material';
import axios from '../../../api/axios';
import useAuth from '../../../context/useAuth';
import { GET_CUSTOMERS_URL, ADMIN_UPDATE_CUSTOMER_URL } from '../../../api/endpoints';
import { DIALOG_ACTIONS_ENUM } from '../../../helpers/DialogHelpers';
import CustomersTable from '../../../components/admin/CustomersTable';
import LoaderCentered from '../../../components/shared/LoaderCentered';
import AlertError from '../../../components/shared/AlertError';
import AlertSuccess from '../../../components/shared/AlertSuccess';
import HandleConfirm from '../../../components/admin/HandleConfirm';
import { GetUnprocessableEntityMessage } from '../../../helpers/ExceptionHelpers';

export default function Customers() {
  const { auth } = useAuth();
  const [crumbs, setCrumbs] = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);

  const [customers, setCustomers] = useState();
  const [currentCustomer, setCurrentCustomer] = useState();
  
  useEffect(() => {
    setCrumbs([
      {
        route: '/customers',
        title: 'Customers'
      }
    ])

    const getCustomers = async () => {
      setLoading(true);
      setError(false);
      setErrorMessage("");

      try {
        const response = await axios.get(
          GET_CUSTOMERS_URL, 
          {
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${auth.accessToken}` 
            },
            withCredentials: true
          })

        setCustomers(response.data);
        setLoading(false);
      }
      catch(err) {
        setLoading(false);
        setError(true);

        if(!err.response) {
          setErrorMessage("No response from server, try again later");
        }
        else {
          setErrorMessage(err.response.data.Message);
        }
      }
    }
    
    getCustomers();
  }, []);

  const editCustomer = (cellValues) => {
    setOpenConfirm(true);
    setCurrentCustomer(cellValues.row)
  }

  const saveCustomerChanges = async () => {
    setSaveLoading(true);
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.patch(
        ADMIN_UPDATE_CUSTOMER_URL + currentCustomer.id, 
        [
          {
            "op": "replace",
            "path": '/email',
            "value": currentCustomer.email
          },
          {
            "op": "replace",
            "path": '/phone1',
            "value": currentCustomer.phone1
          },
          {
            "op": "replace",
            "path": '/phone2',
            "value": currentCustomer.phone2
          }
        ],
        {
          headers: { 
            'Content-Type': 'application/json-patch+json', 
            'Authorization': `Bearer ${auth.accessToken}` 
          },
          withCredentials: true
        })

      setSuccess(true);
      setSuccessMessage("Update successful!");
      setSaveLoading(false);
    } 
    catch (err) {
      setSaveLoading(false);
      setError(true);

      if(!err.response) {
        setErrorMessage("No response from server, try again later.");
      }
      else if(err.response.status === 422) {
        let errorMessages = GetUnprocessableEntityMessage(err.response.data.Message)
        setErrorMessage(errorMessages)
      }
      else {
        setErrorMessage(err.response.data.Message);
      }
    }
  }

  const closeConfirm = () => {
    setOpenConfirm(false);
  }

  const closeErrorAlert = () => {
    setError(false);
  }

  const closeSuccessAlert = () => {
    setSuccess(false);
  }

  return (
    <>
      <HandleConfirm 
        openConfirm={openConfirm} 
        closeConfirm={closeConfirm} 
        editConfirm={saveCustomerChanges}
        deleteConfirm={saveCustomerChanges}
        dialogTitle={"Confirm changes"}
        dialogText={"Are you sure you want to save the changes?"}
        action={DIALOG_ACTIONS_ENUM.EDIT}
      />

      <Typography variant="h3" mb={4}>
        Customers
      </Typography>

      <AlertError error={error} closeErrorAlert={closeErrorAlert} errorMessage={errorMessage} />
      <AlertSuccess success={success} closeSuccessAlert={closeSuccessAlert} successMessage={successMessage} />
      {loading ? (
        <>
          <LoaderCentered />
          <Typography variant="body1" sx={{ textAlign: 'center' }} mt={2}>Loading customers...</Typography>
        </>
      ) : (
        customers && <CustomersTable customers={customers} editCustomer={editCustomer} saveLoading={saveLoading} />
      )}
    </>
  );
}