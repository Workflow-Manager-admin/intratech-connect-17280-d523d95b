import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Card, CardActionArea, CardContent, Grid, Avatar } from "@mui/material";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResultsPage() {
  const query = useQuery();
  const q = query.get("q") || "";
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (q)
      axios.get(`/api/search?q=${encodeURIComponent(q)}`).then(res => setResults(res.data));
    else setResults(null);
  }, [q]);

  return (
    <Box>
      <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
        Search Results {q ? `for "${q}"` : ""}
      </Typography>
      {!results && (
        <Typography sx={{ mt: 5 }} color="text.secondary">
          Enter a search term above.
        </Typography>
      )}
      {results && (
        <Box>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Articles</Typography>
          <Grid container spacing={2}>
            {results.articles.length ? (
              results.articles.map((a) => (
                <Grid item xs={12} md={6} lg={4} key={a.id}>
                  <Card>
                    <CardActionArea onClick={() => navigate(`/articles/${a.id}`)}>
                      <CardContent>
                        <Typography variant="h6">{a.title}</Typography>
                        <Typography fontSize={13} color="text.secondary">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {a.content.slice(0, 70)}...
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ ml: 2, mt: 2 }}>
                No articles found.
              </Typography>
            )}
          </Grid>
          <Typography variant="h6" sx={{ mt: 5, mb: 1 }}>Users</Typography>
          <Grid container spacing={2}>
            {results.users.length ? (
              results.users.map((u) => (
                <Grid item xs={12} md={4} key={u.id}>
                  <Card>
                    <CardActionArea onClick={() => navigate(`/users/${u.id}`)}>
                      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar>{u.name[0]}</Avatar>
                        <Box>
                          <Typography fontWeight={600}>{u.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {u.bio}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ ml: 2, mt: 2 }}>
                No matching users found.
              </Typography>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
