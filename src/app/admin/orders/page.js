"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import {
  Container,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import OrderStatus from "@/models/OrderStatus";

// Import our custom components
import OrderFilters from "@/components/admin/orders/OrderFilters";
import OrderTable from "@/components/admin/orders/OrderTable";
import ViewOrderDialog from "@/components/admin/orders/ViewOrderDialog";
import EditOrderDialog from "@/components/admin/orders/EditOrderDialog";
import DeleteOrderDialog from "@/components/admin/orders/DeleteOrderDialog";

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
  const [deliveryMenList, setDeliveryMenList] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      }
    } else if (status === "unauthenticated") {
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

  // Function to fetch delivery men
  const fetchDeliveryMen = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users?role=DELIVERY_MAN", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching delivery men");
      }

      const data = await response.json();

      if (data.success) {
        setDeliveryMenList(data.users);
      }
    } catch (err) {
      console.error("Error fetching delivery men:", err);
    }
  }, []);

  // Load orders and delivery men when page loads
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchOrders();
      fetchDeliveryMen();
    }
  }, [status, session, fetchOrders, fetchDeliveryMen]);

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

  // Function to change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Functions to handle dialogs
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditFormData({
      status: order.status,
      deliveryMan: order.deliveryDetails?.assignedTo?._id || "",
      note: order.deliveryDetails?.deliveryNotes || "",
    });
    setEditDialogOpen(true);
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  // Handle form changes for edit dialog
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Function to update an order
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);

      // Prepare data structure to match API expectations
      const updateData = {
        status: editFormData.status,
      };

      // Add delivery details if there are changes
      if (editFormData.deliveryMan || editFormData.note) {
        updateData.deliveryDetails = {};

        if (editFormData.deliveryMan) {
          updateData.deliveryDetails.assignedTo = editFormData.deliveryMan;
        }

        if (editFormData.note) {
          updateData.deliveryDetails.deliveryNotes = editFormData.note;
        }
      }

      const response = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: "PATCH", // Changed from PUT to PATCH
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: "Order updated successfully!",
          severity: "success",
        });
        setEditDialogOpen(false);
        fetchOrders(); // Refresh orders list
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error updating order",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error updating order",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to delete an order
  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: "Order deleted successfully!",
          severity: "success",
        });
        setDeleteDialogOpen(false);
        fetchOrders(); // Refresh orders list
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error deleting order",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error deleting order",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Function to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // If user is not authenticated yet, show loading
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Orders Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Refresh"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Order Filters */}
      <OrderFilters
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
      />

      {/* Orders Table */}
      <OrderTable
        orders={paginatedOrders}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredOrders.length}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        handleViewOrder={handleViewOrder}
        handleEditOrder={handleEditOrder}
        handleDeleteOrder={handleDeleteOrder}
      />

      {/* View Order Dialog */}
      <ViewOrderDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        order={selectedOrder}
      />

      {/* Edit Order Dialog */}
      <EditOrderDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        order={selectedOrder}
        editFormData={editFormData}
        handleEditFormChange={handleEditFormChange}
        deliveryMenList={deliveryMenList}
        onUpdate={handleUpdateOrder}
      />

      {/* Delete Order Dialog */}
      <DeleteOrderDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        order={selectedOrder}
      />

      {/* Snackbar for notifications */}
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
