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
  FormControlLabel,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { UserRoles } from "@/models/UserRoles";

// Function to format the date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Component to display role with corresponding color
const RoleChip = ({ role }) => {
  let color = "default";

  switch (role) {
    case UserRoles.ADMIN:
      color = "secondary";
      break;
    case UserRoles.USER:
      color = "primary";
      break;
    case UserRoles.DELIVERY_MAN:
      color = "info";
      break;
    default:
      color = "default";
  }

  return <Chip label={role} color={color} size="small" />;
};

export default function AdminUsers() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();

  // States for managing users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // States for filtering
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // States for dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // States for editing a user
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "",
    active: true,
    password: "",
    resetVerification: false,
  });

  // States for creating a user
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: UserRoles.USER,
    password: "",
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

  // Function to fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching users");
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || "Error fetching users");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users when page loads
  useEffect(() => {
    if (status === "authenticated" && session.user.role === "ADMIN") {
      fetchUsers();
    }
  }, [status, session, fetchUsers]);

  // Filter users by role and search term
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesSearch =
      searchTerm === "" ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm) ||
      user._id?.includes(searchTerm);

    return matchesRole && matchesSearch;
  });
  // Function to change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Functions to manage dialogs
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      role: user.role || UserRoles.USER,
      active: user.active !== false, // Default to true if undefined
      password: "",
      resetVerification: false,
    });
    setEditDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setCreateFormData({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      role: UserRoles.USER,
      password: "",
    });
    setCreateDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Function to create a user
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (
        !createFormData.name ||
        !createFormData.email ||
        !createFormData.password
      ) {
        setSnackbar({
          open: true,
          message: "All fields are required",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createFormData),
      });

      const data = await response.json();

      if (response.ok) {
        // Close dialog and refresh list
        setCreateDialogOpen(false);
        fetchUsers();

        setSnackbar({
          open: true,
          message: "User created successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error creating user",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Error creating user",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to update a user
  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!editFormData.name || !editFormData.email) {
        setSnackbar({
          open: true,
          message: "Name and email are required",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok) {
        // Close dialog and refresh list
        setEditDialogOpen(false);
        fetchUsers();

        setSnackbar({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error updating user",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Error updating user",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a user
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Close dialog and refresh list
        setDeleteDialogOpen(false);
        fetchUsers();

        setSnackbar({
          open: true,
          message: "User deleted successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error deleting user",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Error deleting user",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // If user is not authenticated yet, show loading
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

  // Pagination of users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
            User Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create New User
          </Button>
        </Box>
        <Box sx={{ display: "flex", mb: 3, gap: 2, flexWrap: "wrap" }}>
          <TextField
            select
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value={UserRoles.ADMIN}>Admin</MenuItem>
            <MenuItem value={UserRoles.USER}>User</MenuItem>
            <MenuItem value={UserRoles.DELIVERY_MAN}>Delivery Man</MenuItem>
          </TextField>

          <TextField
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            placeholder="Search by name or email"
          />

          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
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
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Inscrit le</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleChip role={user.role} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active !== false ? "Actif" : "Inactif"}
                        color={user.active !== false ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? formatDate(user.createdAt) : "Unknown"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewUser(user)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete User"
                        disabled={user._id === session?.user?.id}
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
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page"
        />
      </Paper>

      {/* Dialogue de visualisation des détails */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size xs={12}>
                <Typography variant="subtitle1">
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {selectedUser.name || "Not Provided"}
                </Typography>
              </Grid>

              <Grid size xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Grid>

              <Grid size xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">
                  {selectedUser.phoneNumber || "Not Provided"}
                </Typography>
              </Grid>

              <Grid size xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Role
                </Typography>
                <RoleChip role={selectedUser.role} />
              </Grid>

              <Grid size xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Address
                </Typography>
                <Typography variant="body1">
                  {selectedUser.address || "Not Provided"}
                </Typography>
              </Grid>

              <Grid size xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedUser.active !== false ? "Active" : "Inactive"}
                  color={selectedUser.active !== false ? "success" : "default"}
                  size="small"
                />
              </Grid>

              <Grid size xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Email Verified
                </Typography>
                <Chip
                  label={
                    selectedUser.emailVerified ? "Verified" : "Not Verified"
                  }
                  color={selectedUser.emailVerified ? "success" : "warning"}
                  size="small"
                />
              </Grid>

              <Grid size xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Registration Date
                </Typography>
                <Typography variant="body1">
                  {selectedUser.createdAt
                    ? formatDate(selectedUser.createdAt)
                    : "Unknown"}
                </Typography>
              </Grid>

              <Grid size xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Last Login
                </Typography>
                <Typography variant="body1">
                  {selectedUser.lastLogin
                    ? formatDate(selectedUser.lastLogin)
                    : "Never"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'édition d'utilisateur */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
              />
            </Grid>

            <Grid size xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                type="email"
                required
              />
            </Grid>

            <Grid size xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editFormData.phoneNumber}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid size xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Role"
                value={editFormData.role}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, role: e.target.value })
                }
                required
              >
                <MenuItem value={UserRoles.ADMIN}>Admin</MenuItem>
                <MenuItem value={UserRoles.USER}>User</MenuItem>
                <MenuItem value={UserRoles.DELIVERY_MAN}>Delivery Man</MenuItem>
              </TextField>
            </Grid>

            <Grid size xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
                multiline
                rows={2}
              />
            </Grid>

            <Grid size xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Account Settings
              </Typography>
            </Grid>

            <Grid size xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.active}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        active: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Account Active"
              />
            </Grid>

            <Grid size xs={12}>
              <TextField
                fullWidth
                label="New Password"
                value={editFormData.password}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, password: e.target.value })
                }
                type="password"
                helperText="Leave blank to keep current password"
              />
            </Grid>

            <Grid size xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.resetVerification}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        resetVerification: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Reset Email Verification"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de création d'utilisateur */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, name: e.target.value })
                }
                required
              />
            </Grid>

            <Grid size xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={createFormData.email}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    email: e.target.value,
                  })
                }
                type="email"
                required
              />
            </Grid>

            <Grid size xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={createFormData.phoneNumber}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid size xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Role"
                value={createFormData.role}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, role: e.target.value })
                }
                required
              >
                <MenuItem value={UserRoles.ADMIN}>Admin</MenuItem>
                <MenuItem value={UserRoles.USER}>User</MenuItem>
                <MenuItem value={UserRoles.DELIVERY_MAN}>Delivery Man</MenuItem>
              </TextField>
            </Grid>

            <Grid size xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={createFormData.address}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    address: e.target.value,
                  })
                }
                multiline
                rows={2}
              />
            </Grid>

            <Grid size xs={12}>
              <TextField
                fullWidth
                label="Password"
                value={createFormData.password}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    password: e.target.value,
                  })
                }
                type="password"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
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
