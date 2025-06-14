'use client';
import * as React from 'react';
import Image from 'next/image';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link'; // Keep next/link for navigation
import { useTheme } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import MailIcon from '@mui/icons-material/Mail';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Cookies from 'js-cookie';

const navItems = [
  { labelKey: 'Accueil', href: '/', icon: <HomeIcon /> },
  { labelKey: 'Services', href: '/services', icon: <LocalShippingIcon /> },
  { labelKey: 'À Propos', href: '/a-propos', icon: <InfoIcon /> },
  { labelKey: 'Contact', href: '/contact', icon: <MailIcon /> },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
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
      </Link>
      <List>
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
        <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <Button component={Link} href="/login" variant="contained" color="primary" sx={{ textTransform: 'none', width: '80%' }}>
            {t('Login')}
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar component="nav" position="sticky" sx={{ top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
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
            <Button component={Link} href="/login" variant="contained" color="primary" sx={{ marginLeft: '16px' }}>
              {t('Login')}
            </Button>
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