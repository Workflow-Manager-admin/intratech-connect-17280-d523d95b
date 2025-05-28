import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Card = styled.article`
  background: var(--kavia-dark);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  margin-bottom: 18px;
  padding: 20px 24px 18px 24px;
  transition: box-shadow .14s;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  &:hover {
    box-shadow: 0 5px 17px 0 rgba(250,160,50,0.09);
    border-color: var(--kavia-orange);
  }
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-color);
`;

const Meta = styled.div`
  color: var(--text-secondary);
  font-size: 0.97rem;
  margin-bottom: 8px;
`;

const Snippet = styled.p`
  margin: 0 0 8px 0;
  color: var(--text-secondary);
  font-size: 1.09rem;
`;

const TagList = styled.div`
  margin-top: 7px;
`;

const Tag = styled(Link)`
  background: var(--kavia-orange);
  color: #fff;
  border-radius: 12px;
  padding: 3px 10px;
  margin: 3px;
  font-size: 0.93rem;
  text-decoration: none;
  &:hover { opacity: .83; }
`;

export default function ArticleCard({ article, author, tags }) {
  return (
    <Card>
      <Title>
        <Link to={`/articles/${article.id}`}>{article.title}</Link>
      </Title>
      <Meta>
        By {author?.name || "Unknown"}
        {" "} | {new Date(article.createdAt).toLocaleDateString()}
      </Meta>
      <Snippet>{article.content.slice(0, 140)}{article.content.length > 140 ? "..." : ""}</Snippet>
      <TagList>
        {tags && tags.slice(0, 5).map(tag =>
          <Tag key={tag.id} to={`/tags/${tag.id}`}>{tag.name}</Tag>
        )}
      </TagList>
    </Card>
  );
}
