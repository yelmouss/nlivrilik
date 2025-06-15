"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import OrderStatus from "@/models/OrderStatus";

export default function AdminDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();

  // States for the dashboard
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalDeliveryMen: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch orders
        const ordersResponse = await fetch("/api/admin/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Fetch users
        const usersResponse = await fetch("/api/admin/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!ordersResponse.ok || !usersResponse.ok) {
          throw new Error("Error fetching data");
        }

        const ordersData = await ordersResponse.json();
        const usersData = await usersResponse.json();
        if (ordersData.success && usersData.success) {
          // Calculate statistics
          const orders = ordersData.orders;
          const users = usersData.users;

          const pendingOrders = orders.filter(
            (order) => order.status === OrderStatus.PENDING
          ).length;
          const confirmedOrders = orders.filter(
            (order) => order.status === OrderStatus.CONFIRMED
          ).length;
          const deliveredOrders = orders.filter(
            (order) => order.status === OrderStatus.DELIVERED
          ).length;
          const cancelledOrders = orders.filter(
            (order) => order.status === OrderStatus.CANCELLED
          ).length;

          const admins = users.filter((user) => user.role === "ADMIN").length;
          const deliveryMen = users.filter(
            (user) => user.role === "DELIVERY_MAN"
          ).length;
          const clients = users.filter((user) => user.role === "USER").length;

          setDashboardData({
            totalOrders: orders.length,
            pendingOrders,
            confirmedOrders,
            deliveredOrders,
            cancelledOrders,
            totalUsers: users.length,
            totalAdmins: admins,
            totalDeliveryMen: deliveryMen,
            totalClients: clients,
          });
        } else {
          throw new Error("Error fetching data");
        }
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [status, session]);
  // If user is not yet authenticated, display loading
  if (status === "loading") {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Consider adjusting if layout issues persist
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}> {/* Changed maxWidth to "lg" */}
      {" "}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome, {session?.user?.name || "Administrator"}! Manage your orders,
          users, and configurations.
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : (
        <>          {/* Removed Paper for overall stats, focusing on individual cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Order Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {dashboardData.totalOrders}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="warning.main">
                        {dashboardData.pendingOrders}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="info.main">
                        {dashboardData.confirmedOrders}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confirmed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="success.main">
                        {dashboardData.deliveredOrders}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Delivered
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  User Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {dashboardData.totalUsers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="secondary.main">
                        {dashboardData.totalAdmins}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Admins
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="info.main">
                        {dashboardData.totalDeliveryMen}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Delivery Men
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" color="success.main">
                        {dashboardData.totalClients}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Clients
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>          {/* Quick Access Cards */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <ShoppingCartIcon
                      fontSize="large"
                      color="primary"
                      sx={{ mr: 2 }}
                    />{" "}
                    <Typography variant="h5" component="div">
                      Order Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    View, modify, and manage all orders. Track their status and
                    update their progress.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    href="/admin/orders"
                    size="small"
                    fullWidth
                    variant="contained"
                  >
                    Access
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PeopleIcon
                      fontSize="large"
                      color="primary"
                      sx={{ mr: 2 }}
                    />{" "}
                    <Typography variant="h5" component="div">
                      User Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Add, modify, or delete users. Manage roles and permissions.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    href="/admin/users"
                    size="small"
                    fullWidth
                    variant="contained"
                  >
                    Access
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <MailOutlineIcon
                      fontSize="large"
                      color="primary"
                      sx={{ mr: 2 }}
                    />{" "}
                    <Typography variant="h5" component="div">
                      Email Test
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Test the email sending configuration of the application.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    href="/admin/test-email"
                    size="small"
                    fullWidth
                    variant="contained"
                  >
                    Access
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
