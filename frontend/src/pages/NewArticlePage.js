import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, MenuItem, Chip, Select, InputLabel, FormControl, OutlinedInput
} from "@mui/material";
import axios from "axios";

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/categories").then(res => setAllCategories(res.data));
    axios.get("/api/tags").then(res => setAllTags(res.data));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await axios.post("/api/articles", {
        title,
        content,
        category,
        tags,
        authorId: 1 // Demo: hardcoded admin user. Normally, get from auth context/session.
      });
      navigate(`/articles/${resp.data.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" color="primary" fontWeight={600} gutterBottom>
        Publish New Article
      </Typography>
      <TextField
        label="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        fullWidth
        sx={{ my: 2 }}
      />
      <TextField
        label="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        fullWidth
        multiline
        rows={10}
        sx={{ my: 2 }}
      />
      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={e => setCategory(e.target.value)}
          input={<OutlinedInput label="Category" />}
        >
          {allCategories.map(cat => (
            <MenuItem value={cat.name} key={cat.id}>{cat.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel>Tags</InputLabel>
        <Select
          multiple
          value={tags}
          onChange={e => setTags(e.target.value)}
          input={<OutlinedInput label="Tags" />}
          renderValue={selected => (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {selected.map((val) => (
                <Chip key={val} label={val} />
              ))}
            </Box>
          )}
        >
          {allTags.map(tag => (
            <MenuItem key={tag.id} value={tag.name}>{tag.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={saving || !title || !content || !category}
        sx={{ px: 5, fontWeight: 600 }}
      >
        {saving ? "Publishing..." : "Publish"}
      </Button>
    </Box>
  );
}
