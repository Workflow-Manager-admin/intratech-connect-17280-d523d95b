import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { Lock, Email, Person, Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Utility functions for validation
const validateEmail = (email) =>
  !!email && /^[^@]+@[^@]+\.[^@]+$/.test(email);
const validatePassword = (pw) =>
  !!pw && pw.length >= 5;
const validateName = (name) =>
  !!name && name.trim().length > 1;

function AuthTabPanel({ value, index, children }) {
  return (
    value === index && (
      <Box sx={{ px: 2, py: 3 }}>
        {children}
      </Box>
    )
  );
}

const initialReg = { name: "", email: "", password: "" };
const initialLog = { email: "", password: "" };

export default function AuthPage() {
  const [mode, setMode] = useState(0); // 0: login, 1: register
  const [reg, setReg] = useState(initialReg);
  const [log, setLog] = useState(initialLog);
  const [showPass, setShowPass] = useState(false);

  // Error state for fields
  const [regErr, setRegErr] = useState({});
  const [logErr, setLogErr] = useState({});
  const [formMsg, setFormMsg] = useState("");

  const navigate = useNavigate();
  const { login, setLoading, loading } = useAuth();

  // validate and set individual reg errors
  const handleRegInput = (field, value) => {
    setReg(r => ({ ...r, [field]: value }));
    validateRegistration({ ...reg, [field]: value }, false);
  };

  const handleLogInput = (field, value) => {
    setLog(l => ({ ...l, [field]: value }));
    validateLogin({ ...log, [field]: value }, false);
  };

  // Validation functions
  const validateRegistration = (data, showErrors = true) => {
    let errors = {};
    if (!validateName(data.name)) errors.name = "Your full name is required.";
    if (!validateEmail(data.email)) errors.email = "A valid email is required.";
    if (!validatePassword(data.password))
      errors.password = "Password must be at least 5 characters.";

    if (showErrors) setRegErr(errors);
    return !Object.keys(errors).length;
  };
  const validateLogin = (data, showErrors = true) => {
    let errors = {};
    if (!validateEmail(data.email)) errors.email = "A valid email is required.";
    if (!validatePassword(data.password))
      errors.password = "Password must be at least 5 characters.";

    if (showErrors) setLogErr(errors);
    return !Object.keys(errors).length;
  };

  // PUBLIC_INTERFACE
  const handleReg = async (e) => {
    e.preventDefault();
    setFormMsg("");
    setRegErr({});
    if (!validateRegistration(reg, true)) {
      setFormMsg("Please fix the fields marked in red.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", {
        name: reg.name,
        email: reg.email,
        password: reg.password,
      });
      login(res.data.token, res.data.user);
      setFormMsg("");
      // Redirect to dashboard or home
      navigate("/dashboard");
    } catch (err) {
      let msg = "Registration failed.";
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      setFormMsg(msg);
      // Handle specific field errors (email conflict, etc.)
      if (msg.toLowerCase().includes("email")) {
        setRegErr(r => ({ ...r, email: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleLog = async (e) => {
    e.preventDefault();
    setFormMsg(""); setLogErr({});
    if (!validateLogin(log, true)) {
      setFormMsg("Please check your login details.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", {
        email: log.email,
        password: log.password,
      });
      login(res.data.token, res.data.user);
      setFormMsg("");
      navigate("/dashboard");
    } catch (err) {
      let msg = "Login failed.";
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      setFormMsg(msg);
      if (msg.toLowerCase().includes("email")) {
        setLogErr(e => ({ ...e, email: msg }));
      } else if (msg.toLowerCase().includes("password")) {
        setLogErr(e => ({ ...e, password: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPass = () => setShowPass((v) => !v);

  return (
    <Box
      sx={{
        background: { xs: "#fff", md: "#fafbfc" },
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: 370,
          maxWidth: "96vw",
          borderRadius: 5,
          boxShadow: "0 6px 24px 0 rgba(30,41,120,0.09)",
          transition: "box-shadow .19s, border .15s, background .18s",
          "&:hover": {
            boxShadow: "0 9px 32px 0 rgba(44,74,180,0.11)",
            borderColor: "#1A237E"
          },
          "&:focus-within": {
            boxShadow: "0 0 0 3px #B1C3FF"
          }
        }}
      >
        <Tabs
          value={mode}
          onChange={(_, v) => { setMode(v); setFormMsg(""); }}
          variant="fullWidth"
          sx={{
            background: "#f5f7fb",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            "& .MuiTab-root": {
              fontWeight: 600,
              color: "#3949AB",
              "&.Mui-selected": {
                color: "#fff",
                background: "#1A237E",
                borderRadius: 3,
              },
              transition: "all 0.2s",
            },
          }}
          TabIndicatorProps={{ sx: { display: "none" } }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        <AuthTabPanel value={mode} index={0}>
          <form onSubmit={handleLog} noValidate>
            <TextField
              label="Email"
              type="email"
              value={log.email}
              onChange={e => handleLogInput("email", e.target.value)}
              fullWidth
              required
              error={!!logErr.email}
              helperText={logErr.email}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              autoFocus
              sx={{
                transition: "box-shadow 0.17s, border-color 0.15s, background 0.18s",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1A237E"
                  }
                }
              }}
            />
            <TextField
              label="Password"
              type={showPass ? "text" : "password"}
              value={log.password}
              onChange={e => handleLogInput("password", e.target.value)}
              fullWidth
              required
              error={!!logErr.password}
              helperText={logErr.password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPass} edge="end" tabIndex={-1}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                transition: "box-shadow 0.17s, border-color 0.15s, background 0.18s",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1A237E"
                  }
                }
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                mt: 2,
                py: 1.4,
                fontWeight: 700,
                borderRadius: "9px",
                textTransform: "none",
                fontSize: 17,
                background: "#1A237E",
                color: "#fff",
                boxShadow: "none",
                transition: "background .20s, box-shadow .16s",
                "&:hover": { bgcolor: "#2334c7" },
                "&:focus-visible": {
                  backgroundColor: "#2231a0",
                  boxShadow: "0 0 0 3px #B1C3FF"
                }
              }}
              disableElevation
            >
              Sign In
            </Button>
            {formMsg && (
              <FormHelperText
                sx={{
                  my: 1.5,
                  mb: 1,
                  color:
                    formMsg.includes("Logged in")
                      ? "success.main"
                      : (formMsg.includes("Please") || formMsg.includes("check"))
                      ? "error.main"
                      : "text.secondary"
                }}
              >
                {formMsg}
              </FormHelperText>
            )}
          </form>
        </AuthTabPanel>
        <AuthTabPanel value={mode} index={1}>
          <form onSubmit={handleReg} noValidate>
            <TextField
              label="Name"
              value={reg.name}
              onChange={e => handleRegInput("name", e.target.value)}
              fullWidth
              required
              error={!!regErr.name}
              helperText={regErr.name}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                transition: "box-shadow 0.17s, border-color 0.15s, background 0.18s",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1A237E"
                  }
                }
              }}
            />
            <TextField
              label="Email"
              type="email"
              value={reg.email}
              onChange={e => handleRegInput("email", e.target.value)}
              fullWidth
              required
              error={!!regErr.email}
              helperText={regErr.email}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                transition: "box-shadow 0.17s, border-color 0.15s, background 0.18s",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1A237E"
                  }
                }
              }}
            />
            <TextField
              label="Password"
              type={showPass ? "text" : "password"}
              value={reg.password}
              onChange={e => handleRegInput("password", e.target.value)}
              fullWidth
              required
              error={!!regErr.password}
              helperText={regErr.password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPass} edge="end" tabIndex={-1}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                transition: "box-shadow 0.17s, border-color 0.15s, background 0.18s",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1A237E"
                  }
                }
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                mt: 2,
                py: 1.4,
                fontWeight: 700,
                borderRadius: "9px",
                textTransform: "none",
                fontSize: 17,
                background: "#1A237E",
                color: "#fff",
                boxShadow: "none",
                transition: "background .20s, box-shadow .16s",
                "&:hover": { bgcolor: "#2334c7" },
                "&:focus-visible": {
                  backgroundColor: "#2231a0",
                  boxShadow: "0 0 0 3px #B1C3FF"
                }
              }}
              disableElevation
            >
              Sign Up
            </Button>
            {formMsg && (
              <FormHelperText
                sx={{
                  my: 1.5,
                  mb: 1,
                  color:
                    formMsg.includes("Registered")
                      ? "success.main"
                      : formMsg.includes("Please")
                      ? "error.main"
                      : "text.secondary"
                }}
              >
                {formMsg}
              </FormHelperText>
            )}
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Demo only. No real registration.
            </Typography>
          </form>
        </AuthTabPanel>
      </Paper>
    </Box>
  );
}
