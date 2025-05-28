import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  CircularProgress,
  Avatar,
  IconButton,
  Stack,
  FormHelperText,
} from "@mui/material";
import CollectionsIcon from "@mui/icons-material/Collections";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

/**
 * This component handles BOTH create and edit of blog posts, based on if :id param is present.
 * - Form: title, tags (multi), rich text content, image upload (optional), save/cancel buttons
 * - Theme: Blue-accented, clean, responsive, minimal
 */

// Simple rich text editor (contenteditable); accessible and minimal.
function RichTextEditor({ value, onChange, label, error }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line
  }, [value]);

  const emitChange = () => {
    onChange(ref.current.innerHTML);
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography
        id="rich-text-label"
        component="label"
        fontWeight={600}
        htmlFor="rich-content-edit"
        color="primary"
        sx={{ display: "block", mb: 1 }}
      >
        {label}
      </Typography>
      <Box
        id="rich-content-edit"
        ref={ref}
        role="textbox"
        contentEditable
        spellCheck
        tabIndex={0}
        aria-label={label}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "content-help" : undefined}
        suppressContentEditableWarning
        onInput={emitChange}
        sx={{
          background: "#f6f7fb",
          border: error ? "1.5px solid #c93e39" : "1.5px solid #dde3f7",
          borderRadius: 3,
          minHeight: 160,
          fontSize: 17,
          px: 2,
          py: 1.6,
          outline: "none",
          mb: error ? 0.7 : 2,
          "&:focus": { borderColor: "#1A237E", background: "#f1f3fd" },
          transition: "border-color .13s,background .13s"
        }}
      />
      {error && (
        <FormHelperText id="content-help" sx={{ color: "#c93e39", mb: 2 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}

export default function CreateEditBlogPostPage() {
  // If editing, :id is present; else, creating new.
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [imageData, setImageData] = useState(null); // base64
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(isEdit); // loading, only if edit mode
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState({});
  const [apiErr, setApiErr] = useState("");

  // Tag data
  useEffect(() => {
    axios.get("/api/tags").then(res => setAllTags(res.data)).catch(() => setAllTags([]));
  }, []);

  // Load article if edit mode
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    axios.get(`/api/articles/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setTags(res.data.tags || []);
        if (res.data.image) setImageData(res.data.image);
      })
      .catch(() => setApiErr("Failed to load blog post."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // PUBLIC_INTERFACE
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setFormErr(f => ({ ...f, image: "Please upload a valid image file." }));
      setImageFile(null);
      setImageData(null);
      return;
    }
    setImageFile(file);
    setFormErr(f => ({ ...f, image: null }));
    const reader = new window.FileReader();
    reader.onload = (evt) => {
      setImageData(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  // PUBLIC_INTERFACE
  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = "Title is required.";
    if (!content.replace(/<(.|
)*?>/g, '').trim()) errors.content = "Add your article content.";
    if (!tags.length) errors.tags = "Select at least one tag.";
    if (imageFile && !/^image\//.test(imageFile.type)) errors.image = "Invalid image file.";
    setFormErr(errors);
    return Object.keys(errors).length === 0;
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErr("");
    if (!validate()) return;
    setSaving(true);

    try {
      const payload = {
        title,
        content,
        tags,
        image: imageData, // send base64 or omit
        authorId: 1 // Demo: hardcoded (Admin). Replace with session in real app.
      };
      let response;
      if (isEdit) {
        response = await axios.put(`/api/articles/${id}`, payload);
      } else {
        response = await axios.post("/api/articles", payload);
      }
      navigate(`/articles/${response.data.id}`);
    } catch (e) {
      setApiErr("Failed to save post. Please try again.");
    }
    setSaving(false);
  };

  // Cancel button - go back
  const handleCancel = () => {
    if (isEdit) {
      navigate(`/articles/${id}`);
    } else {
      navigate("/dashboard");
    }
  };

  // Public facing UI
  if (loading) return (
    <Box sx={{ mt: 9, textAlign: "center" }}>
      <CircularProgress color="primary" />
    </Box>
  );

  return (
    <Box
      sx={{
        maxWidth: 680,
        mx: "auto",
        bgcolor: "background.paper",
        borderRadius: 4,
        p: { xs: 2, sm: 3, md: 5 },
        boxShadow: "0 6px 24px 0 rgba(30,41,120,0.07)",
      }}
      component="form"
      autoComplete="off"
      onSubmit={handleSubmit}
      aria-labelledby="create-edit-form-header"
    >
      <Typography
        id="create-edit-form-header"
        variant="h4"
        fontWeight={700}
        color="primary"
        sx={{ mb: 2.5, textAlign: "left", letterSpacing: 0.2 }}
        gutterBottom
      >
        {isEdit ? "Edit Blog Post" : "Create Blog Post"}
      </Typography>

      {/* Title */}
      <TextField
        label="Title"
        value={title}
        autoFocus
        onChange={e => { setTitle(e.target.value); setFormErr(f => ({ ...f, title: null })); }}
        required
        fullWidth
        inputProps={{ maxLength: 120, "aria-label": "Blog Title" }}
        error={!!formErr.title}
        helperText={formErr.title}
        sx={{ mb: 2 }}
      />

      {/* Tags */}
      <FormControl fullWidth sx={{ mb: 2 }} error={!!formErr.tags}>
        <InputLabel id="tag-label">Tags</InputLabel>
        <Select
          labelId="tag-label"
          label="Tags"
          multiple
          value={tags}
          input={<OutlinedInput label="Tags" />}
          renderValue={selected => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7 }}>
              {selected.map((val) => (
                <Chip key={val} label={val} color="secondary" />
              ))}
            </Box>
          )}
          onChange={e => { setTags(e.target.value); setFormErr(f => ({ ...f, tags: null })); }}
          MenuProps={{
            PaperProps: { sx: { maxHeight: 280 } },
          }}
          sx={{ background: "#f6f7fb" }}
        >
          {allTags.length ? (
            allTags.map((tag) => (
              <MenuItem key={tag.id} value={tag.name}>
                {tag.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="">No tags available</MenuItem>
          )}
        </Select>
        {formErr.tags && <FormHelperText>{formErr.tags}</FormHelperText>}
      </FormControl>

      {/* Rich Content */}
      <RichTextEditor
        value={content}
        onChange={v => { setContent(v); setFormErr(f => ({ ...f, content: null })); }}
        label="Content"
        error={formErr.content}
      />

      {/* Image upload */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }} color="primary" variant="body1">
          (Optional) Cover Image
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<CollectionsIcon />}
            variant="outlined"
            component="label"
            color="primary"
            sx={{
              bgcolor: "#f6f7fb",
              borderRadius: 3,
              fontWeight: 500,
              "&:hover": { bgcolor: "#e8eeff" }
            }}
            aria-label="Upload image"
          >
            {imageData ? "Change Image" : "Choose Image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImage}
              aria-label="Image file input"
            />
          </Button>
          {imageData && (
            <Box position="relative" display="inline-block">
              <Avatar
                src={imageData}
                alt="Preview"
                variant="rounded"
                sx={{ width: 60, height: 60, border: "2px solid #1A237E" }}
              />
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: -14,
                  right: -16,
                  bgcolor: "#fff",
                  border: "1.5px solid #eee",
                }}
                onClick={() => {
                  setImageData(null);
                  setImageFile(null);
                }}
                aria-label="Remove image"
              >
                <CancelIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          )}
        </Stack>
        {formErr.image && <FormHelperText error>{formErr.image}</FormHelperText>}
      </Box>

      {/* API/server error */}
      {apiErr && (
        <Typography color="error" sx={{ mb: 2 }}>
          {apiErr}
        </Typography>
      )}

      {/* Actions */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="secondary"
          sx={{ minWidth: 120, borderRadius: 3, fontWeight: 600 }}
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={saving}
          sx={{
            minWidth: 140,
            borderRadius: 3,
            fontWeight: 700,
            bgcolor: "#1A237E",
            color: "#fff",
            "&:hover": { bgcolor: "#2231a0" }
          }}
        >
          {saving ? (
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          ) : isEdit ? "Save" : "Publish"}
        </Button>
      </Stack>
    </Box>
  );
}
