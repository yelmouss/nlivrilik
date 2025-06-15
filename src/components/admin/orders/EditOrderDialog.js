"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";
import OrderStatus from "@/models/OrderStatus";

export default function EditOrderDialog({
  open,
  onClose,
  order,
  editFormData,
  handleEditFormChange,
  deliveryMenList,
  onUpdate,
}) {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{"Edit Order"}</DialogTitle>
      <DialogContent>        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">{"Status"}</InputLabel>              <Select
                labelId="status-label"
                name="status"
                value={editFormData.status}
                onChange={handleEditFormChange}
                label={"Status"}
              >
                {Object.values(OrderStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="deliveryMan-label">{"Delivery Man"}</InputLabel>
              <Select
                labelId="deliveryMan-label"
                name="deliveryMan"
                value={editFormData.deliveryMan}
                onChange={handleEditFormChange}
                label={"Delivery Man"}
              >
                <MenuItem value=""><em>{"None"}</em></MenuItem>
                {deliveryMenList.map((man) => (
                  <MenuItem key={man._id} value={man._id}>
                    {man.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              name="note"
              label={"Note"}
              value={editFormData.note}
              onChange={handleEditFormChange}
              multiline
              rows={3}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{"Cancel"}</Button>
        <Button onClick={onUpdate} variant="contained" color="primary">
          {"Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
