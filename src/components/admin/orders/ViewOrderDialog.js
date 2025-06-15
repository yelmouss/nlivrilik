"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import ViewOrderMap from "./ViewOrderMap";

// Function to format the date (can be moved to a utils file if used elsewhere)
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

// Component to display status with corresponding color (can be moved to a utils file or a shared components file)
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
  const statusText = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return <Chip label={statusText} color={color} size="small" />;
};

export default function ViewOrderDialog({ open, onClose, order }) {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{`View Order #${order._id}`}</DialogTitle>
      <DialogContent dividers>        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              {"Customer Name"}:
            </Typography>
            <Typography variant="body1">
              {order.contactInfo?.fullName || "N/A"}
            </Typography>
          </Grid>{" "}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              {"Customer Email"}:
            </Typography>
            <Typography variant="body1">
              {order.contactInfo?.email || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              {"Customer Phone"}:
            </Typography>
            <Typography variant="body1">
              {order.contactInfo?.phoneNumber || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              {"Delivery Address"}:
            </Typography>
            <Typography variant="body1">
              {order.deliveryAddress?.formattedAddress || "N/A"}
            </Typography>
            {order.deliveryAddress?.additionalInfo && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {"Additional Info: "}
                {order.deliveryAddress.additionalInfo}
              </Typography>
            )}{" "}
            {/* Carte avec marqueur de localisation */}
            {order.deliveryAddress?.coordinates?.coordinates && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {"Delivery Location"}:
                </Typography>
                <ViewOrderMap
                  key={`map-${order._id}`}
                  coordinates={order.deliveryAddress.coordinates.coordinates}
                  address={order.deliveryAddress.formattedAddress}
                />
              </Box>
            )}          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              {"Order Date"}:
            </Typography>
            <Typography variant="body1">
              {formatDate(order.createdAt)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              {"Status"}:
            </Typography>
            <StatusChip status={order.status} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              {"Order Content"}:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 1,
              }}
            >
              {order.orderContent || "No content specified"}
            </Typography>
          </Grid>          {order.financialDetails && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {"Subtotal"}:
                </Typography>
                <Typography variant="body1">
                  {order.financialDetails.subtotal || 0} DA
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {"Delivery Fee"}:
                </Typography>
                <Typography variant="body1">
                  {order.financialDetails.deliveryFee || 0} DA
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {"Total Amount"}:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {order.financialDetails.total || 0} DA
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {"Payment Method"}:
                </Typography>
                <Typography variant="body1">
                  {order.financialDetails.paymentMethod?.toUpperCase() ||
                    "CASH"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {"Payment Status"}:
                </Typography>
                <Chip
                  label={order.financialDetails.isPaid ? "Paid" : "Unpaid"}
                  color={order.financialDetails.isPaid ? "success" : "error"}
                  size="small"
                />
              </Grid>
            </>
          )}          {order.deliveryDetails?.assignedTo && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                {"Assigned Delivery Man"}:
              </Typography>
              <Typography variant="body1">
                {order.deliveryDetails.assignedTo.name || "Not Assigned"}
              </Typography>
            </Grid>
          )}
          {order.deliveryDetails?.estimatedDeliveryTime && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                {"Estimated Delivery"}:
              </Typography>
              <Typography variant="body1">
                {formatDate(order.deliveryDetails.estimatedDeliveryTime)}
              </Typography>
            </Grid>
          )}
          {order.deliveryDetails?.actualDeliveryTime && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                {"Actual Delivery"}:
              </Typography>
              <Typography variant="body1">
                {formatDate(order.deliveryDetails.actualDeliveryTime)}
              </Typography>
            </Grid>
          )}          {order.deliveryDetails?.deliveryNotes && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                {"Delivery Notes"}:
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {order.deliveryDetails.deliveryNotes}
              </Typography>
            </Grid>
          )}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                {"Status History"}:
              </Typography>{" "}
              <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                {order.statusHistory.map((history, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      p: 1,
                      border: "1px solid lightgray",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      component="div"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      <StatusChip status={history.status} />
                      <Typography component="span" variant="body2">
                        - {formatDate(history.timestamp)}
                        {history.note && ` - ${history.note}`}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{"Close"}</Button>
      </DialogActions>
    </Dialog>
  );
}
