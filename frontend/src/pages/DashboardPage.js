import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../AuthContext";

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

// PUBLIC_INTERFACE
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch user info and user's articles on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/users/${ACTIVE_USER_ID}`)
      .then((res) => setUser(res.data));
    axios
      .get(`/api/articles?author=${ACTIVE_USER_ID}`)
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Delete post handler
  // PUBLIC_INTERFACE
  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await axios.delete(`/api/articles/${id}`);
      setPosts((posts) => posts.filter((a) => a.id !== id));
    } catch (e) {
      alert("Failed to delete post.");
    }
    setDeleteId(null);
  };

  // UI starts here

  return (
    <Box sx={{ maxWidth: 1160, mx: "auto" }}>
      {/* Welcome section */}
      <Box
        sx={{
          background: `linear-gradient(96deg, #e3eafd 0, #fff 100%)`,
          borderRadius: 5,
          p: { xs: 3, sm: 5 },
          mb: 4,
          display: "flex",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          boxShadow: "0 3px 18px 0 rgba(30,51,150,0.10)",
        }}
      >
        <Avatar
          src={user?.avatar || ""}
          sx={{
            width: 76,
            height: 76,
            fontSize: 38,
            bgcolor: "#1A237E",
            color: "#fff",
            fontWeight: 700,
            boxShadow: "0 2px 10px 0 #cfd7fa57",
          }}
        >
          {(!user?.avatar && user?.name) ? user.name[0] : "?"}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            fontWeight={600}
            color="secondary"
            sx={{ mb: .2 }}
          >
            Welcome, {user ? user.name : "…"}!
          </Typography>
          <Typography color="text.secondary" fontSize={16}>
            Ready to share your latest insight or update? Create a new blog post or manage your published articles below.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          sx={{
            minWidth: 180,
            fontWeight: 700,
            fontSize: 17,
            borderRadius: 3,
            boxShadow: "0 4px 18px 0 rgba(30,40,150,0.065)",
            background: "#1A237E",
            letterSpacing: 0.1,
            "&:hover": {
              background: "#2334c7",
              boxShadow: "0 6px 22px 0 rgba(60,81,200,0.13)",
            }
          }}
          onClick={() => navigate("/articles/new")}
        >
          New Post
        </Button>
      </Box>

      {/* Your posts */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "end", gap: 1 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Your Blog Posts
        </Typography>
        <Chip
          label={posts.length}
          color="secondary"
          size="small"
          sx={{ fontWeight: 700 }}
        />
      </Box>
      {loading ? (
        <Typography color="text.secondary" sx={{ mt: 6 }}>
          Loading your articles…
        </Typography>
      ) : posts.length === 0 ? (
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            You haven't published any posts yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ fontWeight: 600, borderRadius: 4 }}
            onClick={() => navigate("/articles/new")}
          >
            Write Your First Post
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card
                elevation={0}
                sx={{
                  border: "2px solid #d2e0ff",
                  borderRadius: 4,
                  background: "#fff",
                  minHeight: 196,
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow .22s, border-color .22s",
                  position: "relative",
                  overflow: "visible",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: "0 10px 30px 0 rgba(44,74,180,.11)",
                    "& .actions": { opacity: 1 }
                  }
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/articles/${post.id}`)}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    "&:hover": { background: "#eef3ff" },
                  }}
                >
                  <CardContent sx={{ px: 0 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary"
                      sx={{
                        mb: .6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      fontSize={14}
                      color="text.secondary"
                      sx={{ mb: 1.2 }}
                    >
                      {formatDate(post.createdAt)}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{
                        mb: 1.2,
                        minHeight: 44,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                      }}
                    >
                      {post.content.slice(0, 100)}
                      {post.content.length > 100 ? "…" : ""}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {post.tags?.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          color="secondary"
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
                <CardActions
                  className="actions"
                  sx={{
                    justifyContent: "flex-end",
                    pt: 0,
                    pb: 1,
                    pr: 1.5,
                    opacity: .84,
                    transition: "opacity .16s",
                    position: "absolute",
                    top: 10,
                    right: 10,
                    gap: 1,
                    zIndex: 2,
                    opacity: 0 // Only visible on card hover
                  }}>
                  <Tooltip title="Edit">
                    <span>
                      <IconButton
                        color="primary"
                        size="small"
                        sx={{
                          "&:hover": { background: "#e3eafd" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/articles/${post.id}/edit`);
                        }}
                        aria-label={`Edit ${post.title}`}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <span>
                      <IconButton
                        color="secondary"
                        size="small"
                        disabled={deleteId === post.id}
                        sx={{
                          "&:hover": { background: "#f5e9ec", color: "#c33" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to delete this post? This cannot be undone."
                            )
                          ) {
                            handleDelete(post.id);
                          }
                        }}
                        aria-label={`Delete ${post.title}`}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
