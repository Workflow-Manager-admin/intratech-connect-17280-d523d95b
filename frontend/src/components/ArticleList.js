import React from "react";
import styled from "styled-components";
import ArticleCard from "./ArticleCard";

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function ArticleList({ articles, users, tags }) {
  if (!Array.isArray(articles)) return null;
  return (
    <ListContainer>
      {articles.map(article => {
        const author = users?.find(u => u.id === article.authorId);
        const articleTags = Array.isArray(article.tags)
          ? tags?.filter(t => article.tags.includes(t.id)) ?? []
          : [];
        return (
          <ArticleCard
            key={article.id}
            article={article}
            author={author}
            tags={articleTags}
          />
        );
      })}
    </ListContainer>
  );
}
