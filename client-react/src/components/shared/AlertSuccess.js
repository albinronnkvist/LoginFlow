import { Collapse, Alert, AlertTitle } from "@mui/material"

export default function AlertSuccess({ success, closeSuccessAlert, successMessage}) {
  return (
    <Collapse in={success} sx={{ marginBottom: success ? 2 : 0 }}>
      <Alert 
        severity="success"
        onClose={() => closeSuccessAlert()}
      >
        <AlertTitle>Success!</AlertTitle>
        {successMessage}
      </Alert>
    </Collapse>
  )
}