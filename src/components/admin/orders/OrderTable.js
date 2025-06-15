"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";

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
    case "pending":
      color = "warning";
      break;
    case "confirmed":
      color = "info";
      break;
    case "delivered":
      color = "success";
      break;
    case "cancelled":
      color = "error";
      break;
    default:
      color = "default";
  }

  // Format the status text
  const statusText = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

  return <Chip label={statusText} color={color} size="small" />;
};

export default function OrderTable({
  orders,
  page,
  rowsPerPage,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  handleViewOrder,
  handleEditOrder,
  handleDeleteOrder,
}) {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>{"Order ID"}</TableCell>
              <TableCell>{"Customer"}</TableCell>
              <TableCell>{"Date"}</TableCell>
              <TableCell>{"Status"}</TableCell>
              <TableCell>{"Total"}</TableCell>
              <TableCell>{"Actions"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="subtitle1" color="textSecondary">
                    {"No orders found"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (                <TableRow hover role="checkbox" tabIndex={-1} key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.contactInfo?.fullName || "N/A"}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <StatusChip status={order.status} />
                  </TableCell>
                  <TableCell>
                    {order.financialDetails?.total ? `${order.financialDetails.total} DA` : "Not Set"}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={"View"}>
                      <IconButton onClick={() => handleViewOrder(order)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={"Edit"}>
                      <IconButton onClick={() => handleEditOrder(order)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={"Delete"}>
                      <IconButton onClick={() => handleDeleteOrder(order)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={totalCount || orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={"Rows per page:"}
      />
    </Paper>
  );
}
