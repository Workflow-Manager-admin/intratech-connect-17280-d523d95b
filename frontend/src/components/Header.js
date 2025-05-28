import React from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";

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

export default function Header() {
  return (
    <StyledHeader>
      <Nav>
        <Logo to="/"> 
          <span className="logo-symbol">⌂</span> IntraTech Connect
        </Logo>
        <Menu>
          <StyledNavLink to="/" end>Home</StyledNavLink>
          <StyledNavLink to="/articles/new">Write</StyledNavLink>
          <StyledNavLink to="/categories">Categories</StyledNavLink>
          <StyledNavLink to="/tags">Tags</StyledNavLink>
          <StyledNavLink to="/profile">Profile</StyledNavLink>
        </Menu>
      </Nav>
    </StyledHeader>
  );
}
