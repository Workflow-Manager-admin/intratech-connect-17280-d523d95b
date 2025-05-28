import React, { useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Comments from "./Comments";

const ArticleContainer = styled.article`
  background: var(--kavia-dark);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  margin: 0 auto 32px auto;
  max-width: 700px;
  padding: 36px 30px 24px 30px;
`;

const Title = styled.h1`
  font-size: 2.3rem;
  font-weight: 800;
  margin-bottom: 0.3em;
`;

const Meta = styled.div`
  margin-bottom: 22px;
  font-size: 1.06rem;
  color: var(--text-secondary);
`;

const Content = styled.div`
  font-size: 1.17rem;
  color: var(--text-color);
  margin-bottom: 32px;
  line-height: 1.67;
  white-space: pre-line;
`;

const TagsContainer = styled.div`
  margin-top: 13px;
`;

const Tag = styled(Link)`
  background: var(--kavia-orange);
  color: #fff;
  border-radius: 11px;
  padding: 3px 10px;
  margin-right: 6px;
  font-size: 0.92rem;
  text-decoration: none;
  &:hover { opacity: .9; }
`;

export default function ArticleView({
  article,
  author,
  comments,
  commentUsers,
  tags,
  onAddComment,
  onDeleteComment
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article?.id]);

  if (!article) return (
    <ArticleContainer>
      <div style={{ color: "var(--kavia-orange)", fontSize: "1.22rem" }}>
        Article not found.
      </div>
    </ArticleContainer>
  );

  return (
    <ArticleContainer>
      <Title>{article.title}</Title>
      <Meta>
        By <strong>{author?.name || "Unknown"}</strong> | {new Date(article.createdAt).toLocaleString()}
      </Meta>
      <Content>{article.content}</Content>
      <TagsContainer>
        {tags && tags.map(tag =>
          <Tag key={tag.id} to={`/tags/${tag.id}`}>{tag.name}</Tag>
        )}
      </TagsContainer>
      <hr style={{ border: "1px solid var(--border-color)", margin: "26px 0" }} />
      <Comments
        comments={comments}
        users={commentUsers}
        articleId={article.id}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />
    </ArticleContainer>
  );
}
