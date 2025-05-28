import React from "react";
import styled from "styled-components";
import ArticleCard from "./ArticleCard";

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

/**
 * PUBLIC_INTERFACE
 * ArticleList - now supports renderActions prop for contextual buttons
 */
export default function ArticleList({ articles, users, tags, renderActions }) {
  if (!Array.isArray(articles)) return null;
  return (
    <ListContainer>
      {articles.map(article => {
        const author = users?.find(u => u.id === article.authorId);
        const articleTags = Array.isArray(article.tags)
          ? tags?.filter(t => article.tags.includes(t.id)) ?? []
          : [];
        return (
          <div key={article.id} style={{position: "relative"}}>
            <ArticleCard
              article={article}
              author={author}
              tags={articleTags}
            />
            {renderActions && renderActions(article)}
          </div>
        );
      })}
    </ListContainer>
  );
}
