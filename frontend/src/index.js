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
    },
    error: { main: "#d32f2f" },
    success: { main: "#2e7d32" }
  },
  shape: {
    borderRadius: 9,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          fontWeight: 600,
          textTransform: "none",
          transition: "background 0.21s, box-shadow 0.21s, border-color 0.2s, color 0.19s",
          boxShadow: "none",
          outline: "none",
          "&:hover": {
            backgroundColor: "#2231a0",
            color: "#fff",
            boxShadow: "0 2px 12px 0 rgba(30,51,150,0.10)",
            borderColor: "#2231a0"
          },
          "&:focus-visible": {
            backgroundColor: "#F0F4FF",
            color: "#2231a0",
            boxShadow: "0 0 0 3px #C6D7FF"
          },
          "&:active": {
            backgroundColor: "#142065",
            color: "#fff"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 13
        },
        root: {
          transition: "box-shadow 0.20s, border 0.16s"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          background: "#fff",
          transition: "box-shadow 0.21s, border 0.20s, background 0.20s",
          outline: "none",
          "&:hover": {
            boxShadow: "0 8px 32px 0 rgba(44,74,180,0.12)",
            borderColor: "#1A237E"
          },
          "&:focus-within": {
            boxShadow: "0 0 0 3px #C6D7FF"
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          background: "#fafdff",
          transition: "box-shadow 0.19s, border-color 0.19s, background 0.18s",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1A237E",
            background: "#f4f8ff"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1A237E",
            boxShadow: "0 0 0 2px #B3C7FF"
          }
        },
        notchedOutline: {
          borderColor: "#dde3f7"
        }
      }
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          transition: "box-shadow 0.19s, border-color 0.18s"
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: 16,
          borderRadius: 7,
          background: "#fafdff",
          transition: "box-shadow 0.16s, border-color 0.18s, background 0.17s",
          "&:hover": {
            background: "#f2f6ff"
          },
          "&.Mui-focused": {
            background: "#eef4ff",
            boxShadow: "0 0 0 2px #B3C7FF"
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 7,
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          transition: "background 0.17s, color 0.16s"
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          minHeight: 38,
          transition: "background 0.17s, color 0.16s",
          "&.Mui-selected": {
            background: "#2231a0",
            color: "#fff"
          },
          "&:focus": {
            background: "#e8eefc",
            color: "#2231a0"
          }
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
