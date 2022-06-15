import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Divider, ListItemIcon, AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, MenuItem } from '@mui/material';
import { Close } from '@mui/icons-material';
import useCustomerAuth from '../../../context/useCustomerAuth';
import { customerPages } from '../../../helpers/PagesHelpers';
import Icons from '../../../styles/Icons';
import AccountMenu from './AccountMenu';

export default function Header() {
  const { customerAuth } = useCustomerAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
    setIsOpen(true);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
    setIsOpen(false);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile logo */}
          <Box 
            className='header-logo'
            sx={{ flexGrow: 1, height: 24, display: { xs: 'block', md: 'none' } }}
            component={Link} 
            to={"/"}
            style={{ textDecoration: 'none' }}
          >
            <Typography 
                style={{ color: "#fff" }}
              >
                Login System
            </Typography>
          </Box>

          
          
          {/* Desktop logo */}
          <Box 
            className='header-logo'
            sx={{ 
              flexGrow: 1, 
              height: 30, 
              display: { xs: 'none', md: 'block' }
            }}
            component={Link} 
            to={"/"}
            style={{ textDecoration: 'none' }}
          >
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              style={{ color: "#fff" }}
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              Login System
            </Typography>
          </Box>    
          
          {/* Desktop menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {customerPages.map((page, index) => (
              <Button
                variant="text"
                key={index}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, px: 2, textTransform: 'none' }}
                color="secondary"
                component={Link} 
                to={page.route}
              >
                {page.title}
              </Button>
            ))}
          </Box>
          
          {customerAuth && (
            <AccountMenu />
          )}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="secondary"
            >
              {isOpen ? <Close /> : <Icons.MenuIcon />}
            </IconButton>

            {/* Mobile menu */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              disableScrollLock={true}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' }
              }}
            >
              {customerPages.map((page) => (
                <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center" component={Link} to={page.route} style={{ textDecoration: 'none' }}>
                    {page.title}
                  </Typography>
                </MenuItem>
              ))}
              <Divider />
              {!customerAuth && (
                <MenuItem
                  component={Link} 
                  to={'/customerlogin'}
                >
                  Login&nbsp;
                  <ListItemIcon>
                    <Icons.SignInIcon />
                  </ListItemIcon>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};