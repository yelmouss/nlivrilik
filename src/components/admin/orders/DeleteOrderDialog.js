"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function DeleteOrderDialog({ open, onClose, onConfirm, order }) {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{"Delete Order"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`Are you sure you want to delete order ${order._id}?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{"Cancel"}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {"Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}