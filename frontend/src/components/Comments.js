import React, { useState } from "react";
import styled from "styled-components";

const CommentsContainer = styled.section`
  margin-top: 18px;
`;

const CommentInput = styled.textarea`
  width: 100%;
  border-radius: 5px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-color);
  font-size: 1.08rem;
  min-height: 60px;
  padding: 10px 7px;
  margin-bottom: 8px;
  resize: vertical;
`;

const Button = styled.button`
  background-color: var(--kavia-orange);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 7px 16px;
  font-size: 0.98rem;
  margin-bottom: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #FF8B4D;
  }
`;

const CommentItem = styled.div`
  background: #191919;
  border-radius: 6px;
  padding: 10px 17px 8px 15px;
  margin-bottom: 13px;
  border: 1px solid var(--border-color);
`;

const Meta = styled.div`
  font-size: 0.93em;
  color: var(--text-secondary);
  margin-bottom: 3px;
`;

export default function Comments({
  comments,
  users,
  articleId,
  onAddComment,
  onDeleteComment,
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  // TEMP: Use the first available user as the simulated logged-in user
  const user = users && users.length > 0 ? users[0] : null;

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Cannot post an empty comment.");
      return;
    }
    if (!user) {
      setError("No user logged in.");
      return;
    }
    onAddComment({ articleId, userId: user.id, text });
    setText("");
    setError(null);
  };

  return (
    <CommentsContainer>
      <h3 style={{ color: "var(--kavia-orange)", marginTop: 0 }}>Comments</h3>
      <form onSubmit={handleSubmit}>
        <CommentInput
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment…"
        />
        {error && <div style={{ color: "#F55454", marginBottom: "8px" }}>{error}</div>}
        <div>
          <Button type="submit">Post</Button>
        </div>
      </form>
      {comments && comments.length === 0 && (
        <Meta>No comments yet. Be first to share a thought.</Meta>
      )}
      {(comments || []).map(comment => {
        const commentUser = users.find(u => u.id === comment.userId);
        return (
          <CommentItem key={comment.id}>
            <Meta>
              <strong>{commentUser ? commentUser.name : "User"}</strong>
              {" · "}
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
              {onDeleteComment && user && user.id === comment.userId && (
                <>
                  {" · "}
                  <Button
                    type="button"
                    style={{ background: "#333", color: "#E87A41", fontSize: "0.85em", padding: "2px 7px", marginLeft: "7px" }}
                    onClick={() => onDeleteComment(comment.id)}
                  >Delete</Button>
                </>
              )}
            </Meta>
            <div>
              {comment.text}
            </div>
          </CommentItem>
        );
      })}
    </CommentsContainer>
  );
}
