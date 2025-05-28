import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Avatar, Card, CardActionArea, CardContent, Grid } from "@mui/material";

const formatDate = (d) => new Date(d).toLocaleDateString();

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/users/${id}`).then(res => setUser(res.data));
    axios.get(`/api/articles?author=${id}`).then(res => setArticles(res.data));
  }, [id]);

  if (!user) return <Typography>Loading…</Typography>;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
          {user.name[0]}
        </Avatar>
        <Box>
          <Typography variant="h4">{user.name}</Typography>
          <Typography color="text.secondary">{user.role === "admin" ? "Administrator" : "Contributor"}</Typography>
        </Box>
      </Box>
      <Typography sx={{ mb: 3 }}>{user.bio}</Typography>
      <Typography variant="h5" color="primary" sx={{ mb: 2 }}>Articles by {user.name}</Typography>
      <Grid container spacing={2}>
        {articles.map((article) => (
          <Grid item key={article.id} xs={12} md={6} lg={4}>
            <Card>
              <CardActionArea onClick={() => navigate(`/articles/${article.id}`)}>
                <CardContent>
                  <Typography variant="h6">{article.title}</Typography>
                  <Typography fontSize={13} color="text.secondary">{formatDate(article.createdAt)}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {article.content.slice(0, 70)}...
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      {!articles.length && <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>This user hasn't published any articles yet.</Typography>}
    </Box>
  );
}
