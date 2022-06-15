
import { useState } from 'react';
import { Box } from '@mui/system';
import { ReactComponent as LoaderSvg } from "../../images/dack.svg";
import '../../styles/main.css'

// Custom loader / spinner
export default function Loader({ width, height}) {
  const [inputWidth, setInputWidth] = useState(width);
  const [inputHeight, setInputHeigth] = useState(height);

  if(inputWidth == null) 
  {
    setInputWidth(50)
  }

  if(inputHeight == null)
  {
    setInputHeigth(50)
  }

  return (
    <Box sx={{ width: inputWidth, height: inputHeight }}>
      {/* SVG imported as a React component */}
      <LoaderSvg />
    </Box>
  );
}