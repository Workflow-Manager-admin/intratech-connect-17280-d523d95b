import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Chip, Divider, Avatar, TextField, Button
} from "@mui/material";

const formatDate = (d) => new Date(d).toLocaleString();

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    axios.get(`/api/articles/${id}`).then(res => {
      setArticle(res.data);
      axios.get(`/api/users/${res.data.authorId}`).then(uRes => setAuthor(uRes.data));
    });
    axios.get(`/api/articles/${id}/comments`).then(res => setComments(res.data));
    axios.get("/api/users").then(res => {
      const obj = {};
      res.data.forEach(u => (obj[u.id] = u));
      setUsers(obj);
    });
  }, [id]);

  const submitComment = async () => {
    setCommentLoading(true);
    setCommentError("");
    try {
      const resp = await axios.post(`/api/articles/${id}/comments`, {
        authorId: 2, // demo; normally from auth context!
        content: commentText,
      });
      setComments([...comments, resp.data]);
      setCommentText("");
    } catch (err) {
      setCommentError("Failed to post comment");
    }
    setCommentLoading(false);
  };

  if (!article) return <Typography>Loading…</Typography>;

  return (
    <Box>
      <Typography variant="h3" color="primary" fontWeight="bold">
        {article.title}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 2 }}>
        <Avatar
          src={author?.avatar || ""}
          sx={{ mr: 1 }}
        >
          {(!author?.avatar && author?.name) ? author.name[0] : ""}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{author?.name}</Typography>
          <Typography fontSize={13} color="text.secondary">{formatDate(article.createdAt)}</Typography>
        </Box>
      </Box>
      <div style={{ marginBottom: 20, whiteSpace: "pre-line" }}>
        {article.content}
      </div>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
        {article.tags?.map((tg) => (
          <Chip key={tg} label={tg} color="secondary" />
        ))}
      </Box>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" sx={{ mb: 2 }} color="secondary">
        Comments ({comments.length})
      </Typography>
      <Box>
        {comments.map((c) => (
          <Box key={c.id} sx={{ mb: 3, display: "flex", alignItems: "flex-start" }}>
            <Avatar sx={{ mr: 2 }}>
              {users[c.authorId]?.name ? users[c.authorId].name[0] : "?"}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{users[c.authorId]?.name || "User"}</Typography>
              <Typography fontSize="small" color="text.secondary">
                {formatDate(c.createdAt)}
              </Typography>
              <Typography sx={{ mt: 1 }}>{c.content}</Typography>
            </Box>
          </Box>
        ))}
        {!comments.length && <Typography color="text.secondary">No comments yet.</Typography>}
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Add a Comment</Typography>
        <TextField
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          sx={{ my: 2 }}
          placeholder="Write your comment…"
        />
        <Button
          variant="contained"
          disabled={commentLoading || commentText.length < 2}
          onClick={submitComment}
          color="secondary"
        >
          {commentLoading ? "Posting…" : "Post Comment"}
        </Button>
        {commentError && <Typography color="error">{commentError}</Typography>}
      </Box>
    </Box>
  );
}
