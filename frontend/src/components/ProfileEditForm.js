import React, { useRef, useState } from "react";
import {
  Box,
  Avatar,
  TextField,
  Typography,
  Stack,
  Button,
  CircularProgress,
  IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

// PUBLIC_INTERFACE
/**
 * ProfileEditForm allows user to edit name, bio, and avatar.
 * Props: { user, onSave(updatedUser), onCancel }
 */
export default function ProfileEditForm({ user, onSave, onCancel }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const inputRef = useRef();

  // Handle avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      setErr("Only JPG or PNG image allowed.");
      return;
    }
    setAvatarFile(file);
    const reader = new window.FileReader();
    reader.onload = (evt) => setPreviewURL(evt.target.result);
    reader.readAsDataURL(file);
  };

  // PUBLIC_INTERFACE
  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      // If avatar changed, upload it first.
      let updatedAvatar = avatar;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        // Backend expects /api/users/:id/avatar
        const resp = await axios.post(`/api/users/${user.id}/avatar`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        updatedAvatar = resp.data.avatar;
      }
      // Then update profile fields (name, bio, avatar)
      const { data: updated } = await axios.put(`/api/users/${user.id}`, {
        name,
        bio,
        avatar: updatedAvatar
      });
      if (onSave) onSave(updated);
    } catch (e) {
      setErr("Failed to save profile. " +
        ((e.response && e.response.data && e.response.data.error) || ""));
    }
    setLoading(false);
  }

  return (
    <Box component="form" onSubmit={handleSave} sx={{ mt: 4, maxWidth: 380 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Avatar
          src={previewURL || ""}
          sx={{ width: 68, height: 68, bgcolor: "#b3c3ea", fontSize: 36 }}
        >
          {(!previewURL && name) ? name[0] : ""}
        </Avatar>
        <Box>
          <input
            type="file"
            ref={inputRef}
            accept="image/png,image/jpeg"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={() => inputRef.current && inputRef.current.click()}
            sx={{ borderRadius: 2, fontWeight: 600 }}
            size="small"
          >
            Change Avatar
          </Button>
          {previewURL &&
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setPreviewURL("");
                setAvatarFile(null);
                setAvatar("");
              }}
              sx={{ ml: 1 }}
              title="Remove avatar"
            >
              <CancelIcon fontSize="small" />
            </IconButton>}
        </Box>
      </Stack>
      <TextField
        label="Name"
        value={name}
        fullWidth
        required
        autoFocus
        onChange={e => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Bio"
        value={bio}
        fullWidth
        multiline
        rows={3}
        onChange={e => setBio(e.target.value)}
        sx={{ mb: 3 }}
      />
      {err && <Typography color="error" sx={{ mb: 2 }}>{err}</Typography>}
      <Stack direction="row" spacing={2}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} /> : "Save Changes"}
        </Button>
        <Button variant="outlined" color="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}
