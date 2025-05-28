import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../auth";
import { useNavigate } from "react-router-dom";

/* ---- Styled Components for Bright UI ---- */
const PageBg = styled.div`
  min-height: 88vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd; /* lighter blue */
`;

const AuthBox = styled.div`
  background: #fff;
  min-width: 350px;
  max-width: 360px;
  padding: 36px 32px 28px 32px;
  margin: 40px 0;
  border-radius: 15px;
  box-shadow: 0 4px 18px 0 rgba(33,150,243,0.14);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Title = styled.h2`
  color: #1976d2;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-align: center;
`;

const SwitchText = styled.div`
  margin-top: 10px;
  text-align: center;
  color: #2196f3;
  font-size: 0.98rem;
`;

const Input = styled.input`
  border: 1px solid #bbdefb;
  border-radius: 6px;
  font-size: 1.08rem;
  padding: 10px 11px;
  margin-bottom: 7px;
  width: 100%;
  background: #f8fbfe;
  color: #222;
  transition: border 0.2s;
  &:focus { border: 1.7px solid #2196f3; background: #fff; }
`;

const Button = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px;
  width: 100%;
  font-size: 1.12rem;
  font-weight: 600;
  margin-top: 6px;
  transition: background 0.18s;
  cursor: pointer;
  &:hover { background: #1565c0; }
`;

const ErrorMsg = styled.div`
  color: #d32943;
  background: #ffebee;
  padding: 7px;
  border-radius: 5px;
  margin-bottom: 3px;
  font-size: 0.96em;
  text-align: center;
`;

const SuccessMsg = styled.div`
  color: #1976d2;
  background: #e3f2fd;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 500;
`;


/**
 * PUBLIC_INTERFACE
 * AuthPage component: handles both Login and Register forms.
 * Switches form using state, displays errors, integrates with Auth backend, and redirects.
 */
export default function AuthPage() {
  const [mode, setMode] = useState("login"); // or "register"
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [formTouched, setFormTouched] = useState(false);
  const { user, loading, error, login, register, setError } = useAuth();
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Handle input change
  function handleInput(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setFormTouched(true);
    setError(""); // clear previous error
  }

  // Form validation functions
  function validate() {
    if (mode === "login") {
      return form.email.trim() && form.password.length >= 4;
    }
    // Registration: require name, email, password (min 4)
    return (
      form.name.trim() &&
      form.email.trim() &&
      form.password.length >= 4
    );
  }

  const emailValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setFormTouched(true);
    setError("");
    setSuccess("");
    if (!validate()) return;
    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mode === "login") {
      const result = await login({ email: form.email.trim(), password: form.password });
      if (result) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 650);
      }
    } else {
      const result = await register({
        email: form.email.trim(),
        name: form.name.trim(),
        password: form.password,
      });
      if (result) {
        setSuccess("Registration successful! Logging in...");
        setTimeout(() => navigate("/"), 800);
      }
    }
  }

  // Switch login/register mode
  function switchMode() {
    setError("");
    setSuccess("");
    setForm({ email: "", password: "", name: "" });
    setFormTouched(false);
    setMode(mode === "login" ? "register" : "login");
  }

  // Already logged-in: redirect to home
  if (user) {
    setTimeout(() => navigate("/"), 350);
    return <PageBg><AuthBox><SuccessMsg>Already signed in. Redirecting...</SuccessMsg></AuthBox></PageBg>;
  }

  return (
    <PageBg>
      <AuthBox>
        <Title>{mode === "login" ? "Sign In" : "Register"}</Title>
        {success && <SuccessMsg>{success}</SuccessMsg>}
        {error && <ErrorMsg>{error}</ErrorMsg>}

        <form onSubmit={handleSubmit} noValidate autoComplete="on">
          {mode === "register" && (
            <Input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleInput}
              autoFocus
              autoComplete="name"
              style={{
                borderColor: !formTouched || form.name ? "#bbdefb" : "#d32943"
              }}
            />
          )}
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleInput}
            autoComplete="email"
            style={{
              borderColor:
                !formTouched || emailValid
                  ? "#bbdefb"
                  : "#d32943"
            }}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password (min 4 chars)"
            value={form.password}
            onChange={handleInput}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={4}
            style={{
              borderColor:
                !formTouched || form.password.length >= 4
                  ? "#bbdefb"
                  : "#d32943"
            }}
          />
          <Button type="submit" disabled={loading || !validate()}>
            {loading ? (mode === "login" ? "Signing in..." : "Registering...") : (mode === "login" ? "Sign In" : "Register")}
          </Button>
        </form>
        <SwitchText>
          {mode === "login" ? (
            <>New user? <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={switchMode}>Create an account</span></>
          ) : (
            <>Already have an account? <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={switchMode}>Sign in</span></>
          )}
        </SwitchText>
      </AuthBox>
    </PageBg>
  );
}
