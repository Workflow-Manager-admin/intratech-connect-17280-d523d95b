import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background: var(--kavia-dark);
  color: var(--text-secondary);
  padding: 32px 0 16px 0;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
`;

const FooterInner = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Socials = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
`;

const SocialLink = styled.a`
  color: var(--kavia-orange);
  text-decoration: none;
  font-weight: bold;
`;

export default function Footer() {
  return (
    <FooterContainer>
      <FooterInner>
        <div>
          <strong>IntraTech Connect</strong> &copy; {new Date().getFullYear()} &mdash; IntraTech, Inc.
        </div>
        <div>Knowledge sharing. Collaboration. Growth.</div>
        <Socials>
          <SocialLink href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</SocialLink>
          <SocialLink href="https://twitter.com/" target="_blank" rel="noopener noreferrer">Twitter</SocialLink>
          <SocialLink href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</SocialLink>
        </Socials>
      </FooterInner>
    </FooterContainer>
  );
}
