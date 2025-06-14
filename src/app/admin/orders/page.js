"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import OrderStatus from "@/models/OrderStatus";

// Function to format the date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Component to display status with corresponding color
const StatusChip = ({ status }) => {
  let color = "default";

  switch (status) {
    case OrderStatus.PENDING:
      color = "warning";
      break;
    case OrderStatus.CONFIRMED:
      color = "info";
      break;
    case OrderStatus.DELIVERED:
      color = "success";
      break;
    case OrderStatus.CANCELLED:
      color = "error";
      break;
    default:
      color = "default";
  }

  return <Chip label={status} color={color} size="small" />;
};

export default function AdminOrders() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();

  // States for managing orders
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // States for filtering
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // States for dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // States for editing an order
  const [editFormData, setEditFormData] = useState({
    status: "",
    deliveryMan: "",
    note: "",
  });
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
  // Function to fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching orders");
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || "Error fetching orders");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load orders when page loads
  useEffect(() => {
    if (status === "authenticated" && session.user.role === "ADMIN") {
      fetchOrders();
    }
  }, [status, session, fetchOrders]);

  // Filter orders based on status and search term
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    const searchableFields = [
      order._id,
      order.contactInfo?.fullName,
      order.contactInfo?.email,
      order.contactInfo?.phoneNumber,
      order.deliveryAddress?.formattedAddress,
    ];

    const matchesSearch =
      searchTerm === "" ||
      searchableFields.some(
        (field) =>
          field &&
          field.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  // Paginate orders
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Function to change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Fonction pour changer le nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fonctions pour gérer les dialogues
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditFormData({
      status: order.status,
      deliveryMan: order.deliveryDetails?.assignedTo || "",
      note: "",
    });
    setEditDialogOpen(true);
  };

  // Fonction pour mettre à jour une commande
  const handleUpdateOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation de base
      if (!editFormData.status) {
        setSnackbar({
          open: true,
          message: "Le statut est requis",
          severity: "error",
        });
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editFormData.status,
          deliveryDetails: {
            assignedTo: editFormData.deliveryMan || undefined,
          },
          note: editFormData.note,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Fermer le dialogue et rafraîchir la liste
        setEditDialogOpen(false);
        fetchOrders();

        setSnackbar({
          open: true,
          message: "Commande mise à jour avec succès",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message:
            data.message || "Erreur lors de la mise à jour de la commande",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Erreur lors de la mise à jour de la commande",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir le dialogue de suppression
  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  // Fonction pour confirmer la suppression d'une commande
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Fermer le dialogue et rafraîchir la liste
        setDeleteDialogOpen(false);
        fetchOrders();

        setSnackbar({
          open: true,
          message: "Commande supprimée avec succès",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message:
            data.message || "Erreur lors de la suppression de la commande",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Erreur lors de la suppression de la commande",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Si l'utilisateur n'est pas encore authentifié, afficher un chargement
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Order Management
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
            variant="contained"
          >
            Refresh
          </Button>
        </Box>

        <Box sx={{ display: "flex", mb: 3, gap: 2, flexWrap: "wrap" }}>
          <TextField
            select
            label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 200 }}
          >
            {" "}
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
            <MenuItem value={OrderStatus.CONFIRMED}>Confirmed</MenuItem>
            <MenuItem value={OrderStatus.DELIVERED}>Delivered</MenuItem>
            <MenuItem value={OrderStatus.CANCELLED}>Cancelled</MenuItem>
          </TextField>

          <TextField
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            placeholder="Search for an order..."
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivery Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {order._id.substring(order._id.length - 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.contactInfo.fullName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.contactInfo.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <StatusChip status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {order.deliveryAddress.formattedAddress}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewOrder(order)}
                        title="View details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleEditOrder(order)}
                        title="Edit order"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteOrder(order)}
                        title="Delete order"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page :"
        />
      </Paper>

      {/* Dialogue de visualisation des détails de commande */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size xs={12} md={6}>
                <Typography variant="subtitle1">Contact Information</Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1}>
                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Name
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.contactInfo.fullName}
                    </Typography>
                  </Grid>

                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Email
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.contactInfo.email}
                    </Typography>
                  </Grid>

                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Phone Number
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.contactInfo.phoneNumber}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" sx={{ mt: 3 }}>
                  Delivery Address
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" paragraph>
                  {selectedOrder.deliveryAddress.formattedAddress}
                </Typography>

                {selectedOrder.deliveryAddress.additionalInfo && (
                  <>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Additional Information
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedOrder.deliveryAddress.additionalInfo}
                    </Typography>
                  </>
                )}

                <Typography variant="subtitle1" sx={{ mt: 3 }}>
                  Financial Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1}>
                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Payment Method
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.financialDetails?.paymentMethod
                        ? t(
                            `paymentMethod_${selectedOrder.financialDetails.paymentMethod}`
                          )
                        : "Not specified"}
                    </Typography>
                  </Grid>

                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Delivery Fee
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.financialDetails?.deliveryFee
                        ? `${selectedOrder.financialDetails.deliveryFee} MAD`
                        : "Not specified"}
                    </Typography>
                  </Grid>

                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Total
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.financialDetails?.total
                        ? `${selectedOrder.financialDetails.total} MAD`
                        : "Not specified"}
                    </Typography>
                  </Grid>

                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Payment Status
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Chip
                      label={
                        selectedOrder.financialDetails?.isPaid
                          ? "Paid"
                          : "Unpaid"
                      }
                      color={
                        selectedOrder.financialDetails?.isPaid
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size xs={12} md={6}>
                <Typography variant="subtitle1">Order Information</Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1}>
                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Order ID
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {selectedOrder._id}
                    </Typography>
                  </Grid>

                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Order Date
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography variant="body2">
                      {formatDate(selectedOrder.createdAt)}
                    </Typography>
                  </Grid>

                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <StatusChip status={selectedOrder.status} />
                  </Grid>

                  <Grid size xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Assigned To
                    </Typography>
                  </Grid>
                  <Grid size xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.deliveryDetails?.assignedTo
                        ? selectedOrder.deliveryDetails.assignedTo
                        : "Not assigned"}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" sx={{ mt: 3 }}>
                  Order Content
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: "background.default" }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedOrder.orderContent}
                  </Typography>
                </Paper>

                <Typography variant="subtitle1" sx={{ mt: 3 }}>
                  Status History
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {selectedOrder.statusHistory &&
                selectedOrder.statusHistory.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                    {selectedOrder.statusHistory.map((entry, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          pb: 2,
                          borderBottom:
                            index < selectedOrder.statusHistory.length - 1
                              ? "1px solid rgba(0, 0, 0, 0.12)"
                              : "none",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <StatusChip status={entry.status} />
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(entry.timestamp)}
                          </Typography>
                        </Box>
                        {entry.note && (
                          <Typography variant="body2">{entry.note}</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No status history available
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setViewDialogOpen(false);
              handleEditOrder(selectedOrder);
            }}
          >
            Edit Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'édition de commande */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size xs={12}>
              <TextField
                select
                fullWidth
                label="Status"
                value={editFormData.status}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, status: e.target.value })
                }
                required
              >
                <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={OrderStatus.CONFIRMED}>Confirmed</MenuItem>
                <MenuItem value={OrderStatus.DELIVERED}>Delivered</MenuItem>
                <MenuItem value={OrderStatus.CANCELLED}>Cancelled</MenuItem>
              </TextField>
            </Grid>

            <Grid size xs={12}>
              <TextField
                fullWidth
                label="Delivery Man"
                value={editFormData.deliveryMan}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    deliveryMan: e.target.value,
                  })
                }
                helperText="Optional: Name of the delivery person"
              />
            </Grid>

            <Grid size xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={editFormData.note}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, note: e.target.value })
                }
                multiline
                rows={3}
                placeholder="Optional notes for the order"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateOrder}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Update Order"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression de commande */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this order? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete Order"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
