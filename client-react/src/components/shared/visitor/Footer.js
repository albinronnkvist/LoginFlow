import { Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <>
      <Typography 
        mt={10}
        mb={1}
        variant="body2" 
        align="center"
        color="primary"
      >
        {'© '}
        <Link 
          className="textLink" 
          href="https://www.albinronnkvist.me/en-US"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: "none", color: "#1975d1" }}
        >
          Albin Rönnkvist
        </Link>
        {' '}
        {new Date().getFullYear()}
      </Typography>
        <Typography
        mb={2}
        variant="body2" 
        fontSize={8}
        align="center"
        color="primary"
      >
        {'Icons by: '}
        <Link 
          className="textLink" 
          href="https://icons8.com/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: "none", color: "#1975d1" }}
        >
          icons8
        </Link>
      </Typography>
    </>
  );
}