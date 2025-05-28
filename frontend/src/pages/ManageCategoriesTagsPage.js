import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Paper,
  TextField,
  IconButton,
  Stack,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useAuth } from "../AuthContext";

function editableRowForm({ mode, initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [err, setErr] = useState("");
  return (
    <Box component="form"
      sx={{ display: "flex", alignItems: "center", gap: 2 }}
      onSubmit={e => {
        e.preventDefault();
        if (!name.trim()) {
          setErr("Name required");
          return;
        }
        if (onSave) onSave({ name: name.trim() });
      }}
    >
      <TextField
        size="small"
        value={name}
        onChange={e => { setName(e.target.value); setErr(""); }}
        placeholder="Name"
        required
        sx={{ minWidth: 120 }}
      />
      {err && <Typography color="error" fontSize={13}>{err}</Typography>}
      <Button type="submit" variant="contained" color="primary" size="small" sx={{ ml: 1 }}>
        {mode === "edit" ? "Save" : "Add"}
      </Button>
      <Button onClick={onCancel} size="small" color="secondary">
        Cancel
      </Button>
    </Box>
  );
}

const EditableRowForm = React.memo(editableRowForm);

/**
 * Categories/Tags management page for admins.
 * Allows CRUD for both categories and tags.
 */
export default function ManageCategoriesTagsPage() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [editingCat, setEditingCat] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [createCat, setCreateCat] = useState(false);
  const [createTag, setCreateTag] = useState(false);
  const [msg, setMsg] = useState("");
  const { user } = useAuth();

  // Fetch data
  const loadAll = () => {
    axios.get("/api/categories").then(res => setCategories(res.data));
    axios.get("/api/tags").then(res => setTags(res.data));
  };
  useEffect(loadAll, []);

  // Permission: Only admin
  const isAdmin = user && user.role === "admin";
  if (!isAdmin) return (
    <Box sx={{ py: 5 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Access Denied</Typography>
      <Typography color="text.secondary">Only administrators can manage categories and tags.</Typography>
    </Box>
  );

  // CRUD Handlers
  const handleCategoryEdit = (id, updates) => {
    axios.put(`/api/categories/${id}`, updates)
      .then(() => { setEditingCat(null); loadAll(); setMsg("Category updated."); });
  };
  const handleCategoryDelete = (id) => {
    if (!window.confirm("Delete this category? This may affect articles in this category.")) return;
    axios.delete(`/api/categories/${id}`).then(() => { loadAll(); setMsg("Category deleted."); });
  };
  const handleCategoryCreate = (c) => {
    axios.post('/api/categories', c).then(() => { setCreateCat(false); loadAll(); setMsg("Category created."); });
  };

  const handleTagEdit = (id, updates) => {
    axios.put(`/api/tags/${id}`, updates)
      .then(() => { setEditingTag(null); loadAll(); setMsg("Tag updated."); });
  };
  const handleTagDelete = (id) => {
    if (!window.confirm("Delete this tag? This action cannot be undone.")) return;
    axios.delete(`/api/tags/${id}`).then(() => { loadAll(); setMsg("Tag deleted."); });
  };
  const handleTagCreate = (t) => {
    axios.post('/api/tags', t).then(() => { setCreateTag(false); loadAll(); setMsg("Tag created."); });
  };

  return (
    <Box sx={{ minHeight: "60vh", maxWidth: 700, mx: "auto", py: 3 }}>
      <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 3 }}>
        Manage Categories & Tags
      </Typography>
      <Stack direction="row" spacing={6} sx={{ mb: 5 }}>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography fontWeight={600} color="secondary">Categories</Typography>
            <Button
              size="small"
              color="primary"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setCreateCat(true)}
              sx={{ borderRadius: 2 }}
            >
              Add
            </Button>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    {editingCat === cat.id ? (
                      <EditableRowForm
                        mode="edit"
                        initial={cat}
                        onSave={v => handleCategoryEdit(cat.id, v)}
                        onCancel={() => setEditingCat(null)}
                      />
                    ) : (
                      cat.name
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => setEditingCat(cat.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => handleCategoryDelete(cat.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Dialog open={!!createCat} onClose={() => setCreateCat(false)}>
            <DialogTitle>Add Category</DialogTitle>
            <DialogContent>
              <EditableRowForm
                mode="create"
                initial={{ name: "" }}
                onSave={v => handleCategoryCreate(v)}
                onCancel={() => setCreateCat(false)}
              />
            </DialogContent>
          </Dialog>
        </Paper>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography fontWeight={600} color="secondary">Tags</Typography>
            <Button
              size="small"
              color="primary"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setCreateTag(true)}
              sx={{ borderRadius: 2 }}
            >
              Add
            </Button>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    {editingTag === tag.id ? (
                      <EditableRowForm
                        mode="edit"
                        initial={tag}
                        onSave={v => handleTagEdit(tag.id, v)}
                        onCancel={() => setEditingTag(null)}
                      />
                    ) : (
                      tag.name
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => setEditingTag(tag.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => handleTagDelete(tag.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Dialog open={!!createTag} onClose={() => setCreateTag(false)}>
            <DialogTitle>Add Tag</DialogTitle>
            <DialogContent>
              <EditableRowForm
                mode="create"
                initial={{ name: "" }}
                onSave={v => handleTagCreate(v)}
                onCancel={() => setCreateTag(false)}
              />
            </DialogContent>
          </Dialog>
        </Paper>
      </Stack>
      <Snackbar
        open={!!msg}
        autoHideDuration={1600}
        onClose={() => setMsg("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setMsg("")}>{msg}</Alert>
      </Snackbar>
    </Box>
  );
}
