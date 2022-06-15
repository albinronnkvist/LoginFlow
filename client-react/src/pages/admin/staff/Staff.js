import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';
import axios from '../../../api/axios';
import useAuth from '../../../context/useAuth';
import { GET_USERS_URL, ADMIN_UPDATE_USER_URL, ADMIN_DELETE_USER_URL } from '../../../api/endpoints';
import { DIALOG_ACTIONS_ENUM } from '../../../helpers/DialogHelpers';
import Icons from '../../../styles/Icons';
import LoaderCentered from '../../../components/shared/LoaderCentered';
import AlertError from '../../../components/shared/AlertError';
import AlertSuccess from '../../../components/shared/AlertSuccess';
import HandleConfirm from '../../../components/admin/HandleConfirm';
import UsersTable from '../../../components/admin/UsersTable';
import { Link } from 'react-router-dom';
import { GetUnprocessableEntityMessage } from '../../../helpers/ExceptionHelpers';

export default function Staff() {
  const { auth } = useAuth();
  const [crumbs, setCrumbs] = useOutletContext();

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogText, setDialogText] = useState("");
  const [action, setAction] = useState(DIALOG_ACTIONS_ENUM.NONE);

  const [users, setUsers] = useState();
  const [currentUser, setCurrentUser] = useState();
  
  useEffect(() => {
    setCrumbs([
      {
        route: '/staff',
        title: 'Staff'
      }
    ])

    const getUsers = async () => {
      setLoading(true);
      setError(false);
      setErrorMessage("");

      try {
        const response = await axios.get(
          GET_USERS_URL, 
          {
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${auth.accessToken}` 
            },
            withCredentials: true
          })

        setUsers(response.data);
        setLoading(false);
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
    
    getUsers();
  }, []);

  const editUser = (cellValues) => {
    setDialogTitle("Confirm changes");
    setDialogText("Are you sure you want to save the changes?");
    setAction(DIALOG_ACTIONS_ENUM.EDIT);
    setOpenConfirm(true);
    setCurrentUser(cellValues.row)
  }

  const editUserConfirm = async () => {
    setSaveLoading(true);
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.patch(
        ADMIN_UPDATE_USER_URL + currentUser.id, 
        [
          {
            "op": "replace",
            "path": '/fullName',
            "value": currentUser.fullName
          },
          {
            "op": "replace",
            "path": '/userName',
            "value": currentUser.userName
          },
          {
            "op": "replace",
            "path": '/Email',
            "value": currentUser.email
          },
          {
            "op": "replace",
            "path": '/phoneNumber',
            "value": currentUser.phoneNumber
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

  const deleteUser = (cellValues) => {
    setDialogTitle("Confirm deletion");
    setDialogText("Are you sure you want to delete the user?");
    setAction(DIALOG_ACTIONS_ENUM.DELETE);
    setOpenConfirm(true);
    setCurrentUser(cellValues.row)
  }

  const deleteUserConfirm = async () => {
    setSaveLoading(true);
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.delete(
        ADMIN_DELETE_USER_URL + currentUser.id,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}` 
          },
          withCredentials: true
        })

      setSuccess(true);
      setSuccessMessage("Deletion successful!");
      setUsers(users.filter(o => o.id !== currentUser.id));
      setSaveLoading(false);
    } 
    catch (err) {
      setSaveLoading(false);
      setError(true);

      if(!err.response) {
        setErrorMessage("No response from server, try again later.");
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
        editConfirm={editUserConfirm}
        deleteConfirm={deleteUserConfirm}
        dialogTitle={dialogTitle}
        dialogText={dialogText}
        action={action}
      />

      <Typography variant="h3" mb={4}>
        Staff
      </Typography>

      <Box mb={2}>
        <Button
          variant='contained'
          color='primary'
          component={Link}
          to={"/admin/staff/register"}
          endIcon={<Icons.PlusIcon />}
        >
          Register new
        </Button>
      </Box>

      <AlertError error={error} closeErrorAlert={closeErrorAlert} errorMessage={errorMessage} />
      <AlertSuccess success={success} closeSuccessAlert={closeSuccessAlert} successMessage={successMessage} />
      {loading ? (
        <>
          <LoaderCentered />
          <Typography variant="body1" sx={{ textAlign: 'center' }} mt={2}>Loading staff...</Typography>
        </>
      ) : (
        users && <UsersTable users={users} editUser={editUser} deleteUser={deleteUser} saveLoading={saveLoading} />
      )}
    </>
  );
}