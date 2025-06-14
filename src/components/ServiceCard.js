"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Lottie from "lottie-react";

const ServiceCard = ({ title, description, animationData }) => (
  <Paper elevation={3} sx={{ padding: 3, textAlign: "center", height: "100%" }}>
    <Lottie animationData={animationData} style={{ height: 150, marginBottom: '16px', borderRadius: '8px' }} />
    <Typography variant="h6" component="h3" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2">{description}</Typography>
  </Paper>
);

export default ServiceCard;
