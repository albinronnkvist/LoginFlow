
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';
import Icons from '../../styles/Icons';
import { ReactComponent as WheelSvg } from "../../images/dack-no-spin.svg";

// 401 page.
export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <>
      <Box 
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: "20vh" }}
      >
        <Typography variant="h1" fontSize={120} mr={2}>
          4
        </Typography>
        <WheelSvg width={100} height={100} style={{ maringTop: '10' }} />
        <Typography variant="h1" fontSize={120} ml={2}>
          1
        </Typography>
      </Box>
      <Typography variant="h3" textAlign={'center'} fontFamily={'Roboto'} mt={2}>
        Unauthorized
      </Typography>
      <Typography variant="body1" textAlign={'center'} mt={2}>
        You are not authorized to view the contents of this page.
      </Typography>
      <Box 
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        mt={2}
      >
        <Button 
          variant="text"
          className='textLink'
          startIcon={<Icons.ArrowLeftIcon />}
          style={{ textTransform: 'none' }}
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
      </Box>
    </>
  );
}