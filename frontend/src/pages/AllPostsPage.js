import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Avatar,
  Tabs,
  Tab,
  InputBase,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ListIcon from "@mui/icons-material/ViewList";
import GridIcon from "@mui/icons-material/GridView";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const formatDate = (d) => new Date(d).toLocaleDateString();

export default function AllPostsPage() {
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState({});
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get("/api/articles").then(res => {
      setArticles(res.data);
      setFiltered(res.data);
      setLoading(false);
    });
    axios.get("/api/users").then(res => {
      const obj = {};
      res.data.forEach(u => (obj[u.id] = u));
      setUsers(obj);
    });
  }, []);

  // Filter articles live
  useEffect(() => {
    let items = articles;
    if (q.trim()) {
      const lq = q.toLowerCase();
      items = articles.filter(a =>
        a.title.toLowerCase().includes(lq) ||
        a.content.toLowerCase().includes(lq) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(lq)))
      );
    }
    setFiltered(items);
  }, [q, articles]);

  return (
    <Box>
      <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 2 }}>
        All Blog Posts
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: 2,
          mb: 2,
          alignItems: "center",
        }}
      >
        <form style={{ flex: 1, maxWidth: 340 }} onSubmit={e => e.preventDefault()}>
          <InputBase
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Filter or search posts…"
            startAdornment={<SearchIcon sx={{ color: "#adb2ca", mr: 1 }} />}
            fullWidth
            sx={{
              px: 2,
              py: 1.1,
              background: "#f6f7fb",
              borderRadius: 30,
              fontSize: 16,
              border: "1px solid #ecf0f8",
              transition: "border .2s",
              "&:focus-within": { border: "1px solid #1A237E" },
            }}
          />
        </form>
        <Tabs
          value={view}
          onChange={(_, n) => setView(n)}
          aria-label="view mode"
          sx={{
            minHeight: 0,
            "& .MuiTabs-flexContainer": { gap: 1 },
          }}
          TabIndicatorProps={{ style: { display: "none" } }}
        >
          <Tab
            icon={<GridIcon />}
            value="grid"
            aria-label="Grid"
            sx={{
              minWidth: 48,
              background: view === "grid" ? "#1A237E" : "#fff",
              color: view === "grid" ? "#fff" : "#3949AB",
              borderRadius: 3,
              transition: "all 0.2s",
            }}
          />
          <Tab
            icon={<ListIcon />}
            value="list"
            aria-label="List"
            sx={{
              minWidth: 48,
              background: view === "list" ? "#1A237E" : "#fff",
              color: view === "list" ? "#fff" : "#3949AB",
              borderRadius: 3,
              transition: "all 0.2s",
            }}
          />
        </Tabs>
      </Box>
      {loading ? (
        <Typography color="text.secondary" sx={{ mt: 8 }}>
          Loading posts…
        </Typography>
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 8, textAlign: "center" }}>
          No posts found.
        </Typography>
      ) : view === "grid" ? (
        <Grid container spacing={2}>
          {filtered.map((a) => (
            <Grid item xs={12} md={6} lg={4} key={a.id}>
              <Card
                elevation={0}
                sx={{
                  background: "#fff",
                  border: "1.5px solid #e8eaf5",
                  borderRadius: 3,
                  transition: "border .2s, box-shadow .2s",
                  "&:hover": {
                    border: "1.5px solid #1A237E",
                    boxShadow: "0 8px 30px 0 rgba(60,72,150,0.09)",
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/articles/${a.id}`)}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: .5 }}>
                      {a.title}
                    </Typography>
                    <Typography fontSize={14} color="text.secondary" sx={{ mb: .5 }}>
                      {users[a.authorId]?.name || "User"} | {formatDate(a.createdAt)}
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                      {a.content.slice(0, 72)}...
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {a.tags?.map((t) => (
                        <Chip key={t} label={t} size="small" color="secondary" />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {filtered.map((a, i) => (
            <Card
              key={a.id}
              sx={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                border: "1.5px solid #e8eaf5",
                borderRadius: 3,
                transition: "border .2s, box-shadow .2s",
                mb: 2,
                "&:hover": {
                  border: "1.5px solid #1A237E",
                  boxShadow: "0 8px 30px 0 rgba(60,72,150,0.09)",
                },
              }}
            >
              <CardActionArea
                sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}
                onClick={() => navigate(`/articles/${a.id}`)}
              >
                <Avatar
                  src={users[a.authorId]?.avatar || ""}
                  sx={{
                    ml: 2,
                    mr: 2,
                    bgcolor: "#e3eafc",
                    color: "#223173",
                    fontWeight: 700,
                  }}
                >
                  {!users[a.authorId]?.avatar
                    ? (users[a.authorId]?.name?.[0] || "U")
                    : ""}
                </Avatar>
                <CardContent sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {a.title}
                  </Typography>
                  <Typography fontSize={14} color="text.secondary" sx={{ mb: 1 }}>
                    {users[a.authorId]?.name || "User"} | {formatDate(a.createdAt)}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 15, mb: 1, whiteSpace: "pre-line" }}>
                    {a.content.slice(0, 90)}...
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {a.tags && a.tags.map((t) => (
                      <Chip key={t} label={t} size="small" color="secondary" />
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
