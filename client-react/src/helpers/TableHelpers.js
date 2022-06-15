import { Typography, Box } from '@mui/material';
import Empty from '../components/shared/Empty';

export const CustomNoRowsOverlay = () => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
      <Box>
        <Empty />
        <Typography textAlign="center" variant='body2' color='text.secondary'>No results...</Typography>
      </Box>
    </Box>
  )
}

export const dateFormatter = (value) => {
  var localTime = new Date(value + "Z")

  return (
    localTime.toLocaleString()
  )
}