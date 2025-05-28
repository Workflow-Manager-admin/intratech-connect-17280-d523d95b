import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../auth";

const StyledHeader = styled.header`
  background: var(--kavia-dark);
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  width: 100%;
  z-index: 1000;
`;

const Nav = styled.nav`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 64px;
  background: transparent;
  justify-content: space-between;
  box-sizing: border-box;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  color: var(--kavia-orange);
  letter-spacing: 1px;
  gap: 10px;
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
`;

const StyledNavLink = styled(NavLink)`
  color: var(--text-color);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 3px;
  transition: background 0.15s;
  &:hover, &.active {
    background: var(--kavia-orange);
    color: #fff;
  }
`;

const AuthBtn = styled.button`
  background: none;
  color: var(--kavia-orange);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  margin-left: 15px;
  cursor: pointer;
  padding: 4px 9px;
  border-radius: 3px;
  &:hover {
    background: var(--kavia-orange);
    color: #fff;
  }
`;

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout and redirect to login page
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <StyledHeader>
      <Nav>
        <Logo to="/">
          <span className="logo-symbol">⌂</span> IntraTech Connect
        </Logo>
        <Menu>
          {user ? (
            <>
              <StyledNavLink to="/" end>Home</StyledNavLink>
              <StyledNavLink to="/articles/new">Write</StyledNavLink>
              <StyledNavLink to="/categories">Categories</StyledNavLink>
              <StyledNavLink to="/tags">Tags</StyledNavLink>
              <StyledNavLink to="/profile">Profile</StyledNavLink>
              <AuthBtn type="button" onClick={handleLogout}>Logout</AuthBtn>
            </>
          ) : (
            <>
              <StyledNavLink to="/login">Login</StyledNavLink>
              <StyledNavLink to="/register">Register</StyledNavLink>
            </>
          )}
        </Menu>
      </Nav>
    </StyledHeader>
  );
}
