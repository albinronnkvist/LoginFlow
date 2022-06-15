import { Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Button } from '@mui/material';
import { DIALOG_ACTIONS_ENUM } from '../../helpers/DialogHelpers';

export default function HandleConfirm({ 
    openConfirm, 
    closeConfirm, 
    editConfirm, 
    deleteConfirm, 
    dialogTitle, 
    dialogText, 
    action}) {
  return (
    <Dialog
      open={openConfirm}
      onClose={() => closeConfirm()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {dialogTitle}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {dialogText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeConfirm()} variant="outlined" color='primary'>Avbryt</Button>
        {action === DIALOG_ACTIONS_ENUM.EDIT && (
          <Button onClick={() => {closeConfirm(); editConfirm();}} variant="contained" color='primary' autoFocus>
            Save
          </Button>
        )} 
        {action === DIALOG_ACTIONS_ENUM.DELETE && (
          <Button onClick={() => {closeConfirm(); deleteConfirm();}} variant="contained" color='error' autoFocus>
            Remove
          </Button>
        )} 
      </DialogActions>
    </Dialog>
  )
}