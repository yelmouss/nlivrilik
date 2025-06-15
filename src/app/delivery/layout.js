'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  CircularProgress,
  Alert,
  CssBaseline,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarIcon from '@mui/icons-material/Star';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

const drawerWidth = 280;

const navigationItems = [
  {
    text: 'Tableau de bord',
    icon: <DashboardIcon />,
    href: '/delivery'
  },
  {
    text: 'Commandes disponibles',
    icon: <AssignmentIcon />,
    href: '/delivery/available-orders'
  },
  {
    text: 'Ma commande active',
    icon: <LocalShippingIcon />,
    href: '/delivery/active-order'
  },  {
    text: 'Historique',
    icon: <StarIcon />,
    href: '/delivery/history'
  },
  {
    text: 'Mes Évaluations',
    icon: <StarIcon />,
    href: '/delivery/ratings'
  }
];

export default function DeliveryLayout({ children }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const userMenuOpen = Boolean(userMenuAnchor);

  // Close drawer on small screens by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setDrawerOpen(false);
      } else {
        setDrawerOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check if user is delivery man
  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role !== "DELIVERY_MAN") {
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, session, router]);

  // Load availability status
  useEffect(() => {
    if (status === "authenticated" && session.user.role === "DELIVERY_MAN") {
      fetchAvailabilityStatus();
    }  }, [status, session]);

  const fetchAvailabilityStatus = async () => {
    try {
      const response = await fetch('/api/delivery/status');
      if (response.ok) {
        const data = await response.json();
        setIsAvailable(data.isAvailable);
      }
    } catch (error) {
      console.error('Error fetching availability status:', error);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/delivery/toggle-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsAvailable(data.isAvailable);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render if not authenticated or not delivery man
  if (status !== "authenticated" || session?.user?.role !== "DELIVERY_MAN") {
    return null;
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <LocalShippingIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Livreur
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      {/* Availability Status */}
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isAvailable}
              onChange={handleToggleAvailability}
              disabled={loading}
              color="success"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">
                {isAvailable ? 'Disponible' : 'Indisponible'}
              </Typography>
              <Chip
                size="small"
                label={isAvailable ? 'EN LIGNE' : 'HORS LIGNE'}
                color={isAvailable ? 'success' : 'default'}
                variant={isAvailable ? 'filled' : 'outlined'}
              />
            </Box>
          }
        />
      </Box>
      <Divider />

      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.href ? theme.palette.primary.main : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: pathname === item.href ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }} className="delivery-layout">
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Espace Livreur
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<LocationOnIcon />}
              label={isAvailable ? 'Disponible' : 'Indisponible'}
              color={isAvailable ? 'success' : 'default'}
              variant="outlined"
              size="small"
            />
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <Avatar 
                src={session?.user?.image} 
                alt={session?.user?.name}
                sx={{ width: 32, height: 32 }}
              >
                {session?.user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={userMenuAnchor}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={userMenuOpen}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {session?.user?.name}
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paramètres</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Déconnexion</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              zIndex: theme.zIndex.drawer
            },
          }}
        >
          {drawer}
        </Drawer>        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
          }}
          className="delivery-main-content"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
