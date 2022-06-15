import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Menu, MenuItem, ListItemIcon, IconButton, Tooltip, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import useAuth from '../../../context/useAuth';
import Icons from '../../../styles/Icons'
import jwtDecode from 'jwt-decode';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#16c090',
    color: '#16c090',
    boxShadow: `0 0 0 2px ${theme.primary}`,
    position: 'absolute',
      top: 20,
      left: 36,
      width: '8px',
      height: '8px',
      borderRadius: '100%',
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

export default function AccountMenu() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logOut = () => {
    setAuth(null)
    localStorage.removeItem('authTokens')
    navigate("/");
  }

  return (
    <>
      <Box sx={{flexGrow: 1, display: { xs: 'block', sm: 'none' }}}></Box>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account">
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <IconButton
              onClick={handleClick}
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              color="secondary"
            >
              <Icons.UserIcon />
            </IconButton>
          </StyledBadge>
        </Tooltip>
      </Box>
      <Tooltip title="Log out">
        <IconButton
          size="small"
          sx={{ ml: 1 }}
          onClick={logOut}
          color="secondary"
        >
          <Icons.SignOutIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        disableScrollLock={true}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Typography sx={{ fontSize: 11 }}>
            {jwtDecode(auth.accessToken).username}
            <br />
            {jwtDecode(auth.accessToken).email}
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={logOut}
        >
          <ListItemIcon>
            <Icons.SignOutIcon />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}