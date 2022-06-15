import { Link } from 'react-router-dom';
import { Collapse, Alert, AlertTitle } from "@mui/material"
import Icons from "../../styles/Icons";

export default function AlertErrorWithLink({ error, closeErrorAlert, canClose, errorTitle, errorMessage, errorLink, errorLinkText}) {
  return (
    <Collapse in={error} sx={{ marginBottom: error ? 2 : 0 }}>
      <Alert 
        severity="error"
        onClose={canClose ? () => closeErrorAlert() : null}
      >
        <AlertTitle>{errorTitle}</AlertTitle>
        {errorMessage}
        <Link 
          className="textLink" 
          to={errorLink}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px" }}
        >
          {errorLinkText} &nbsp;<Icons.ArrowRightIcon />
        </Link>
      </Alert>
    </Collapse>
  )
}