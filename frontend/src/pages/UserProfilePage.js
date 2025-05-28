import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Avatar, Card, CardActionArea, CardContent, Grid, Button, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import { useAuth } from "../AuthContext";
import ProfileEditForm from "../components/ProfileEditForm";

const formatDate = (d) => new Date(d).toLocaleDateString();

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const navigate = useNavigate();
  const { user: currentUser, login } = useAuth();

  useEffect(() => {
    axios.get(`/api/users/${id}`).then(res => setUser(res.data));
    axios.get(`/api/articles?author=${id}`).then(res => setArticles(res.data));
  }, [id, reload]);

  if (!user) return <Typography>Loading…</Typography>;

  const isOwnProfile = currentUser && +currentUser.id === +id;

  function handleProfileSave(updated) {
    setEditOpen(false);
    setReload(r => r + 1);
    // If current user just edited their profile, update AuthContext/localStorage to keep them in sync
    if (isOwnProfile && login) {
      login(localStorage.getItem("token"), updated);
    }
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Avatar
          src={user.avatar || ""}
          sx={{ width: 64, height: 64, mr: 2, bgcolor: "#b3c3ea", fontSize: 38 }}
        >
          {(!user.avatar && user.name) ? user.name[0] : ""}
        </Avatar>
        <Box>
          <Typography variant="h4">{user.name}</Typography>
          <Typography color="text.secondary">{user.role === "admin" ? "Administrator" : "Contributor"}</Typography>
        </Box>
        {isOwnProfile && (
          <Box sx={{ ml: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setEditOpen(true)}
              size="small"
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Edit Profile
            </Button>
          </Box>
        )}
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
      {isOwnProfile &&
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogContent>
            <ProfileEditForm user={user} onSave={handleProfileSave} onCancel={() => setEditOpen(false)} />
          </DialogContent>
        </Dialog>
      }
    </Box>
  );
}
