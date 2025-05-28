import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const SidebarContainer = styled.aside`
  width: 260px;
  min-width: 200px;
  margin-top: 24px;
  margin-bottom: 24px;
  flex-shrink: 0;
  background: var(--kavia-dark);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-sizing: border-box;

  @media (max-width: 800px) {
    display: none;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 10px 0;
  color: var(--kavia-orange);
  font-size: 1.11rem;
  letter-spacing: 0.3px;
  font-weight: 600;
`;

const Tag = styled(Link)`
  background: var(--kavia-orange);
  color: #fff;
  border-radius: 14px;
  padding: 3px 11px;
  margin: 3px;
  font-size: 0.96rem;
  text-decoration: none;
  transition: opacity .17s;
  &:hover { opacity: 0.8; }
`;

const CategoryLink = styled(Link)`
  color: var(--kavia-orange);
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.01em;
  display: block;
  margin-bottom: 7px;
`;

const SearchBox = styled.input`
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: transparent;
  color: var(--text-color);
  font-size: 1.02rem;
  padding: 7px 13px;
  margin-bottom: 7px;
  outline: none;
  &:focus { border-color: var(--kavia-orange); }
`;

export default function Sidebar({ onSearch }) {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data));
    fetch("/api/tags")
      .then(res => res.json())
      .then(data => setTags(data));
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <SidebarContainer>
      <div>
        <SectionTitle>Search</SectionTitle>
        <SearchBox
          type="text"
          placeholder="Find articles..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div>
        <SectionTitle>Categories</SectionTitle>
        {categories.map(cat => (
          <CategoryLink key={cat.id} to={`/categories/${cat.id}`}>
            {cat.name}
          </CategoryLink>
        ))}
      </div>
      <div>
        <SectionTitle>Popular Tags</SectionTitle>
        <div>
          {tags.slice(0, 12).map(tag => <Tag key={tag.id} to={`/tags/${tag.id}`}>{tag.name}</Tag>)}
        </div>
      </div>
    </SidebarContainer>
  );
}
