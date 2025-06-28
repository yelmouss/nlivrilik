'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import Cookies from 'js-cookie'; // Import js-cookie
import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Menu, MenuItem, Avatar, FormControl, InputLabel, Select } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import MailIcon from '@mui/icons-material/Mail';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // Added import
import { UserRoles } from '@/models/UserRoles'; // Import UserRoles

const navItems = [
  { labelKey: 'Accueil', href: '/', icon: <HomeIcon /> },
  { labelKey: 'Services', href: '/services', icon: <LocalShippingIcon /> },
  { labelKey: 'À Propos', href: '/a-propos', icon: <InfoIcon /> },
  { labelKey: 'Contact', href: '/contact', icon: <MailIcon /> },
];

// Items à afficher uniquement si l'utilisateur est connecté
const authenticatedItems = [
  { labelKey: 'MyOrders', href: '/my-orders', icon: <ShoppingBagIcon /> },
];

// Item pour l'admin
const adminItem = { labelKey: 'Admin', href: '/admin', icon: <AdminPanelSettingsIcon /> };

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState(null);
  const theme = useTheme();
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const isAuthenticated = status === 'authenticated' && session;
  const isAdmin = isAuthenticated && session.user.role === UserRoles.ADMIN;

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleUserMenuClose();
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const changeLanguage = (event) => {
    const newLocale = event.target.value;
    Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 }); // Set cookie for next-intl to pick up
    router.refresh(); // Refresh the page to apply the new locale
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250, backgroundColor: theme.palette.custom.darkTeal, height: '100%' }} role="presentation">
      <Link href="/" passHref style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <Image src="/logo.png" alt={'NLivri Lik Logo'} width={80} height={24} style={{ objectFit: 'contain' }} className='rounded rounded-full' priority />
      </Link>      <List>
        {navItems.map((item) => (
          <ListItem key={item.labelKey} disablePadding>
            <ListItemButton component={Link} href={item.href} sx={{ pl: 2 }}>
              <ListItemIcon sx={{ color: theme.palette.custom.lightYellow, minWidth: 'auto', mr: 1 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={t(item.labelKey)} sx={{ color: theme.palette.custom.lightYellow }} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {isAuthenticated && authenticatedItems.map((item) => (
          <ListItem key={item.labelKey} disablePadding>
            <ListItemButton component={Link} href={item.href} sx={{ pl: 2 }}>
              <ListItemIcon sx={{ color: theme.palette.custom.lightYellow, minWidth: 'auto', mr: 1 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={t(item.labelKey)} sx={{ color: theme.palette.custom.lightYellow }} />
            </ListItemButton>
          </ListItem>
        ))}

        {isAdmin && (
          <ListItem key={adminItem.labelKey} disablePadding>
            <ListItemButton component={Link} href={adminItem.href} sx={{ pl: 2 }}>
              <ListItemIcon sx={{ color: theme.palette.custom.lightYellow, minWidth: 'auto', mr: 1 }}>
                {adminItem.icon}
              </ListItemIcon>
              <ListItemText primary={t(adminItem.labelKey)} sx={{ color: theme.palette.custom.lightYellow }} />
            </ListItemButton>
          </ListItem>
        )}
        
        <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          {isAuthenticated ? (
            <ListItemButton onClick={handleSignOut} sx={{ justifyContent: 'center' }}>
              <ListItemIcon sx={{ color: theme.palette.custom.lightYellow, minWidth: 'auto', mr: 1 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={t('Logout')} sx={{ color: theme.palette.custom.lightYellow }} />
            </ListItemButton>
          ) : (
            <Button component={Link} href="/auth/signin" variant="contained" color="primary" sx={{ textTransform: 'none', width: '80%' }}>
              {t('Login')}
            </Button>
          )}
        </ListItem>
        <ListItem sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <FormControl sx={{ m: 1, minWidth: '80%' }} size="small">
            <InputLabel id="language-select-label-mobile" sx={{ color: theme.palette.custom.lightYellow }}>{t('Language')}</InputLabel>
            <Select
              labelId="language-select-label-mobile"
              id="language-select-mobile"
              value={locale}
              label={t('Language')}
              onChange={changeLanguage}
              sx={{ color: theme.palette.custom.lightYellow, '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.custom.lightYellow }, '& .MuiSvgIcon-root': { color: theme.palette.custom.lightYellow } }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="ar">العربية</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar component="nav" position="fixed" sx={{ top: 0, left: 0, width: '100vw', zIndex: (theme) => theme.zIndex.appBar }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" passHref style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image src="/logo.png" alt={'NLivri Lik Logo '} width={80} height={24} style={{ objectFit: 'contain' }} className='rounded rounded-full' priority />
            </Link>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.labelKey}
                component={Link}
                href={item.href}
                startIcon={item.icon}
                sx={{
                  fontWeight: 500,
                  margin: '0 10px',
                  color: theme.palette.custom.darkTeal,
                  '&:hover': { backgroundColor: 'rgba(9, 107, 104, 0.08)' },
                }}
              >
                {t(item.labelKey)}
              </Button>
            ))}
            
            {isAuthenticated ? (
              <>
                <Button 
                  onClick={handleUserMenuOpen}
                  startIcon={
                    session.user.image ? (
                      <Avatar 
                        src={session.user.image} 
                        alt={session.user.name} 
                        sx={{ width: 24, height: 24 }}
                      />
                    ) : (
                      <AccountCircleIcon />
                    )
                  }
                  sx={{
                    fontWeight: 500,
                    margin: '0 10px',
                    color: theme.palette.custom.darkTeal,
                    '&:hover': { backgroundColor: 'rgba(9, 107, 104, 0.08)' },
                  }}
                >
                  {session.user.name}
                </Button>
                <Menu
                  anchorEl={userMenuAnchorEl}
                  open={Boolean(userMenuAnchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: { minWidth: 180 }
                  }}
                >
                  {/* <MenuItem onClick={handleUserMenuClose} component={Link} href="/profile">
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t('Profile')} />
                  </MenuItem> */}
                  <MenuItem onClick={handleUserMenuClose} component={Link} href="/my-orders">
                    <ListItemIcon>
                      <ShoppingBagIcon fontSize="small" />
                    </ListItemIcon>
                    {t('MyOrders')}
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem onClick={handleUserMenuClose} component={Link} href="/admin">
                      <ListItemIcon>
                        <AdminPanelSettingsIcon fontSize="small" />
                      </ListItemIcon>
                      {t('Admin')}
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { handleSignOut(); handleUserMenuClose(); }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t('Logout')} />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button component={Link} href="/auth/signin" variant="contained" color="primary" sx={{ marginLeft: '16px' }}>
                {t('Login')}
              </Button>
            )}

            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel id="language-select-label">{t('Language')}</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={locale} // Use locale from useLocale()
                label={t('Language')}
                onChange={changeLanguage}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <IconButton
            color="inherit"
            aria-label={t('open drawer')}
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Ajout d'un padding-top pour compenser la hauteur de la navbar (64px desktop, 56px mobile) */}
      <Box sx={{ height: { xs: 56, sm: 64 }, minHeight: { xs: 56, sm: 64 } }} />
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, backgroundColor: theme.palette.custom.darkTeal },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}