"use client";
import * as React from "react";
import Box from "@mui/material/Box";

const CurvedSection = ({ children, sx: sxFromProps, ...restProps }) => (
  <Box
    sx={{
      position: "relative",
      backgroundColor: "secondary.main", 
      paddingTop: "50px", 
      paddingBottom: "100px", 
      overflow: "hidden", 
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "150%",
        height: "150px",
        borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
        backgroundColor: "background.paper",
        zIndex: 0,
      },
      ...sxFromProps, 
    }}
    {...restProps} 
  >
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </Box>
  </Box>
);

export default CurvedSection;
