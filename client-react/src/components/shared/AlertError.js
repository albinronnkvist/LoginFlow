import { Collapse, Alert, AlertTitle } from "@mui/material"

export default function AlertError({ error, closeErrorAlert, errorMessage}) {
  return (
    <Collapse in={error} sx={{ marginBottom: error ? 2 : 0 }}>
      <Alert 
        severity="error"
        onClose={() => closeErrorAlert()}
      >
        <AlertTitle>Something went wrong.</AlertTitle>
        {errorMessage}
      </Alert>
    </Collapse>
  )
}