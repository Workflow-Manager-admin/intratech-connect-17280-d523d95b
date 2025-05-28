import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1A237E" },
    secondary: { main: "#3949AB" },
    accent: { main: "#FFB300" },
    background: {
      default: "#f6f7fb",
      paper: "#fff"
    }
  },
  shape: {
    borderRadius: 9,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          textTransform: "none",
          transition: "background .18s,box-shadow .18s",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#2231a0",
            boxShadow: "0 2px 10px 0 rgba(30,51,150,0.08)"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 13
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          background: "#fff"
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: 16,
        }
      }
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);
