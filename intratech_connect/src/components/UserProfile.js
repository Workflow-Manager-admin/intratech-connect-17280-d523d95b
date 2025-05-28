import React from "react";
import styled from "styled-components";
import ArticleList from "./ArticleList";

const ProfileContainer = styled.div`
  background: var(--kavia-dark);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  margin: 0 auto 32px auto;
  max-width: 700px;
  padding: 39px 30px 18px 30px;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--border-color);
  margin-right: 20px;
`;

const Name = styled.h1`
  font-size: 2rem;
  margin: 0 0 2px 0;
  font-weight: 700;
  color: var(--text-color);
`;

const Bio = styled.p`
  font-size: 1.08rem;
  color: var(--text-secondary);
`;

const SectionTitle = styled.h3`
  color: var(--kavia-orange);
  font-size: 1.11rem;
  margin-top: 30px;
  font-weight: 700;
`;

export default function UserProfile({ user, myArticles, tags }) {
  if (!user) return (
    <ProfileContainer>
      <div style={{ color: "var(--kavia-orange)", fontSize: "1.15em" }}>
        User not found.
      </div>
    </ProfileContainer>
  );
  return (
    <ProfileContainer>
      <div style={{ display: "flex", alignItems: "center" }}>
        {user.avatarUrl && <Avatar src={user.avatarUrl} />}
        <div>
          <Name>{user.name}</Name>
          <Bio>{user.bio || "No bio provided."}</Bio>
        </div>
      </div>
      <SectionTitle>Articles by {user.name}</SectionTitle>
      <ArticleList articles={myArticles} users={[user]} tags={tags} />
    </ProfileContainer>
  );
}
