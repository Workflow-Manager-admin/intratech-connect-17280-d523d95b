import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const List = styled.ul`
  padding: 0;
  margin: 0 auto 32px auto;
  max-width: 700px;
  border-radius: 8px;
  background: var(--kavia-dark);
  border: 1px solid var(--border-color);
  list-style: none;
`;

const ListItem = styled.li`
  padding: 18px 28px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:last-child { border-bottom: none;}
`;

export default function CategoryList({ categories }) {
  if (!categories.length) return (
    <div style={{color: "var(--kavia-orange)"}}>No categories available.</div>
  );
  return (
    <List>
      {categories.map(cat =>
        <ListItem key={cat.id}>
          <strong>{cat.name}</strong>
          <Link to={`/categories/${cat.id}`} style={{ color: "var(--kavia-orange)" }}>
            View
          </Link>
        </ListItem>
      )}
    </List>
  );
}
