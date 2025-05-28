import React from "react";
import { Box, Typography } from "@mui/material";

export default function NotFoundPage() {
  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <Typography variant="h2" color="primary" fontWeight={700}>404</Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
        Page not found.
      </Typography>
      <Typography color="text.secondary">The page you requested does not exist.</Typography>
    </Box>
  );
}
