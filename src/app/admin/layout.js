"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Added import for Image
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Button,
  Avatar,
  CircularProgress,
  Container,
  Menu,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";

const drawerWidth = 240;

export default function AdminLayout({ children }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
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

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        // Redirect if user is not admin
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      // Redirect to login page if not authenticated
      router.push("/auth/signin");
    }
  }, [status, session, router]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    router.push("/auth/signin");
    handleUserMenuClose();
  };

  const handleNavigateToHome = () => {
    router.push("/");
    handleUserMenuClose();
  };
  // If user is not yet authenticated, display loading
  if (status === "loading") {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }
  // Navigation items - English only for admin section
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
    { text: "Orders", icon: <ShoppingCartIcon />, path: "/admin/orders" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    {
      text: "Test Email",
      icon: <MailOutlineIcon />,
      path: "/admin/test-email",
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(drawerOpen && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <Link
              href="/"
              passHref
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Image
                src="/logo.png"
                alt="NLivri Lik Logo"
                width={80}
                height={24}
                style={{ objectFit: "contain" }}
                priority
              />
            </Link>
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          {/* User Menu */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              onClick={handleUserMenuOpen}
              color="inherit"
              sx={{ textTransform: "none" }}
              startIcon={
                session?.user?.image ? (
                  <Avatar
                    src={session.user.image}
                    alt={session.user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircleIcon />
                )
              }
            >
              {session?.user?.name || "Admin"}
            </Button>

            <Menu
              anchorEl={userMenuAnchor}
              open={userMenuOpen}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleNavigateToHome}>
                <ListItemIcon>
                  <HomeIcon fontSize="small" />
                </ListItemIcon>{" "}
                <ListItemText>Back to site</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor:
              theme.palette.custom?.darkTeal || theme.palette.primary.main, // Example background
            color: theme.palette.custom?.lightYellow || theme.palette.common.white, // Example text color
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
            // necessary for content to be below app bar
            ...theme.mixins.toolbar, // Ensure drawer header aligns with AppBar
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: theme.palette.custom?.lightYellow || theme.palette.common.white,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider
          sx={{
            borderColor: theme.palette.custom?.lightYellow || theme.palette.common.white,
            opacity: 0.2,
          }}
        />
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={pathname === item.path}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor:
                      theme.palette.custom?.lightYellowTrans ||
                      "rgba(255, 255, 255, 0.1)",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.custom?.lightYellowTransHover ||
                        "rgba(255, 255, 255, 0.15)",
                    },
                  },
                  "&:hover": {
                    backgroundColor:
                      theme.palette.custom?.darkTealHover ||
                      "rgba(0, 0, 0, 0.04)",
                  },
                  color: theme.palette.custom?.lightYellow || theme.palette.common.white,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.custom?.lightYellow || theme.palette.common.white,
                    minWidth: "auto",
                    mr: 1.5,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: drawerOpen ? 0 : `-${drawerWidth}px`, // Adjusted for clarity
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : "100%", // Ensure content takes full width when drawer is closed
          display: "flex", // Added for centering
          flexDirection: "column", // Added for centering
          alignItems: "center", // Added for centering
          mt: "64px", // AppBar height, adjust if necessary
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, width: '100%' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
