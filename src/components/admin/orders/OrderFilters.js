"use client";

import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Box
} from "@mui/material";
import OrderStatus from "@/models/OrderStatus"; // Assuming OrderStatus is correctly imported

export default function OrderFilters({
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchTermChange,
}) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">{"Status"}</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={onStatusFilterChange}
              label={"Status"}
            >
              <MenuItem value="all">{"All Statuses"}</MenuItem>
              {Object.values(OrderStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)} 
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <TextField
            fullWidth
            label={"Search orders..."}
            value={searchTerm}
            onChange={onSearchTermChange}
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
