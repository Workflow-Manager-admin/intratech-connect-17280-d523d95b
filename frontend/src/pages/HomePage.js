import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent, Chip, Avatar
} from "@mui/material";

const formatDate = (d) => new Date(d).toLocaleDateString();

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState({});
  const query = useQuery();
  const navigate = useNavigate();

  const category = query.get("category") || "";
  const tag = query.get("tag") || "";

  useEffect(() => {
    let url = "/api/articles";
    if (category) url += `?category=${encodeURIComponent(category)}`;
    else if (tag) url += `?tag=${encodeURIComponent(tag)}`;
    axios.get(url).then(res => setArticles(res.data));
    axios.get("/api/users").then(res => {
      const obj = {};
      res.data.forEach(u => (obj[u.id] = u));
      setUsers(obj);
    });
  }, [category, tag]);

  const featured = articles.find((a) => a.featured) || articles[0];

  return (
    <Box>
      {featured && (
        <Card sx={{ mb: 4, background: "#fffbe8", borderLeft: "6px solid #FFB300" }}>
          <CardActionArea onClick={() => navigate(`/articles/${featured.id}`)}>
            <CardContent>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {featured.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                by {users[featured.authorId]?.name || "Unknown"} | {formatDate(featured.createdAt)}
              </Typography>
              <Typography sx={{ mt: 2 }}>{featured.content.slice(0, 140)}...</Typography>
              <Box sx={{ mt: 2 }}>
                {featured.tags &&
                  featured.tags.map((tag) => (
                    <Chip size="small" key={tag} label={tag} color="secondary" sx={{ mr: 1 }} />
                  ))}
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      )}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Recent Posts
      </Typography>
      <Grid container spacing={2}>
        {articles
          .filter((a) => !featured || a.id !== featured.id)
          .map((article) => (
            <Grid item key={article.id} xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={() => navigate(`/articles/${article.id}`)}>
                  <CardContent>
                    <Typography variant="h6">{article.title}</Typography>
                    <Typography color="text.secondary" fontSize={13} sx={{ mb: 1 }}>
                      {users[article.authorId]?.name || "Unknown"} | {formatDate(article.createdAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {article.content.slice(0, 80)}...
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {article.tags &&
                        article.tags.map((tg) => (
                          <Chip key={tg} label={tg} size="small" color="secondary" />
                        ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
      {!articles.length && (
        <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
          No articles found.
        </Typography>
      )}
    </Box>
  );
}
