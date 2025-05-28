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
} from "@mui/material";
import { Lock, Email, Person, Visibility, VisibilityOff } from "@mui/icons-material";

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
  const [mode, setMode] = useState(0);
  const [reg, setReg] = useState(initialReg);
  const [log, setLog] = useState(initialLog);
  const [showPass, setShowPass] = useState(false);

  // Placeholder for submit actions
  const handleReg = (e) => {
    e.preventDefault();
    // registration logic here
    alert("Registered! (demo)");
  };
  const handleLog = (e) => {
    e.preventDefault();
    // login logic here
    alert("Logged in! (demo)");
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
        elevation={3}
        sx={{
          width: 370,
          maxWidth: "96vw",
          borderRadius: 5,
          boxShadow: "0 5px 22px 0 rgba(60,72,150,0.08)",
        }}
      >
        <Tabs
          value={mode}
          onChange={(_, v) => setMode(v)}
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
          <form onSubmit={handleLog}>
            <TextField
              label="Email"
              type="email"
              value={log.email}
              onChange={e => setLog(l => ({ ...l, email: e.target.value }))}
              fullWidth
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              autoFocus
            />
            <TextField
              label="Password"
              type={showPass ? "text" : "password"}
              value={log.password}
              onChange={e => setLog(l => ({ ...l, password: e.target.value }))}
              fullWidth
              required
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
                borderRadius: "8px",
                textTransform: "none",
                fontSize: 17,
                boxShadow: "none",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#2334c7" },
              }}
            >
              Sign In
            </Button>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Demo only. No real authentication.
            </Typography>
          </form>
        </AuthTabPanel>
        <AuthTabPanel value={mode} index={1}>
          <form onSubmit={handleReg}>
            <TextField
              label="Name"
              value={reg.name}
              onChange={e => setReg(r => ({ ...r, name: e.target.value }))}
              fullWidth
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Email"
              type="email"
              value={reg.email}
              onChange={e => setReg(r => ({ ...r, email: e.target.value }))}
              fullWidth
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              type={showPass ? "text" : "password"}
              value={reg.password}
              onChange={e => setReg(r => ({ ...r, password: e.target.value }))}
              fullWidth
              required
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
                borderRadius: "8px",
                textTransform: "none",
                fontSize: 17,
                boxShadow: "none",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#2334c7" },
              }}
            >
              Sign Up
            </Button>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Demo only. No real registration.
            </Typography>
          </form>
        </AuthTabPanel>
      </Paper>
    </Box>
  );
}
