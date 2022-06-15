import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';

import { MenuItem, Menu, Toolbar, List, Typography, Divider, IconButton, Tooltip, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Close } from '@mui/icons-material';

import useAuth from '../../../context/useAuth';
import jwtDecode from 'jwt-decode';
import { employeePages, adminPages } from '../../../helpers/PagesHelpers';
import Icons from '../../../styles/Icons'
import AccountMenu from './AccountMenu';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function Header() {
  const { auth } = useAuth();
  const theme = useTheme();
  const currentRoute = useLocation();

  const [open, setOpen] = useState(false);
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
    <>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          {/* Mobile menu button */}
          <IconButton
            size="large"
            aria-label="open menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="secondary"
            sx={{
              display: { xs: 'block', md: 'none' },
              paddingLeft: 0
            }}
          >
            {isOpen ? <Close /> : <Icons.MenuIcon />}
          </IconButton>
          
          {/* Desktop menu button */}
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
                display: { xs: 'none', md: 'block'}
              }}
            >
              <Icons.MenuIcon />
            </IconButton>
          )}
          

          {/* Title and logos */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            color="secondary" 
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Login System
          </Typography>
          <AccountMenu />
        </Toolbar>
      </AppBar>
      <Drawer sx={{ display: { xs: 'none', md: 'block'} }} variant="permanent" open={open}>
        <DrawerHeader>
          <Tooltip title="Close menu">
            <IconButton onClick={() => setOpen(false)}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </DrawerHeader>
        <Divider />
        <List>
          {employeePages.map((page, index) => (
            <ListItemButton
              key={index}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5
              }}
              component={Link} 
              to={`/admin${page.route}`}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: currentRoute.pathname.includes(`/admin${page.route}`) && "#1975d1"
                }}
                
              >
                {page.icon && page.icon}
              </ListItemIcon>
              <ListItemText 
                sx={{ 
                  opacity: open ? 1 : 0
                }}
                primaryTypographyProps={{style: {color: currentRoute.pathname.includes(`/admin${page.route}`) && "#1975d1"}}}
                primary={page.title}
              />
            </ListItemButton>
          ))}
        </List>
        {["Administrator", "Manager"].some(el => jwtDecode(auth.accessToken).roles?.includes(el)) && (
          <>
            <Divider />
            <List>
              {adminPages.map((page, index) => (
                <ListItemButton
                  key={index}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  component={Link} 
                  to={`/admin${page.route}`}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: currentRoute.pathname.includes(`/admin${page.route}`) && "#1975d1"
                    }}
                  >
                    {page.icon && page.icon}
                  </ListItemIcon>
                  <ListItemText 
                    sx={{ 
                      opacity: open ? 1 : 0
                    }}
                    primaryTypographyProps={{style: {color: currentRoute.pathname.includes(`/admin${page.route}`) && "#1975d1"}}}
                    primary={page.title}
                  />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </Drawer>

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
        {employeePages.map((page, index) => (
          <MenuItem 
            key={index} 
            onClick={handleCloseNavMenu}
            component={Link} 
            to={`/admin${page.route}`} 
          >
            <ListItemIcon>
              {page.icon && page.icon}
            </ListItemIcon>
            <Typography 
              style={{ textDecoration: 'none' }}
            >
              {page.title}
            </Typography>
          </MenuItem>
        ))}
        <Divider />
        {["Administrator", "Manager"].some(el => jwtDecode(auth.accessToken).roles?.includes(el)) && (
          adminPages.map((page, index) => (
            <MenuItem 
              key={index} 
              onClick={handleCloseNavMenu}
              component={Link} 
              to={`/admin${page.route}`} 
            >
              <ListItemIcon>
                {page.icon && page.icon}
              </ListItemIcon>
              <Typography 
                style={{ textDecoration: 'none' }}
              >
                {page.title}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}