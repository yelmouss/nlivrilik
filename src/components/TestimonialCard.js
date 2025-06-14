"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

const TestimonialCard = ({ text, author }) => (
  <Paper elevation={2} sx={{ padding: 2, fontStyle: "italic", height: "100%" }}>
    <Typography variant="body1">&quot;{text}&quot;</Typography>
    <Typography
      variant="caption"
      display="block"
      sx={{ textAlign: "right", mt: 1 }}
    >
      - {author}
    </Typography>
  </Paper>
);

export default TestimonialCard;
