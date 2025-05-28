import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, Typography, IconButton, List, Drawer, Divider, ListItem, ListItemText, ListSubheader, InputBase, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import { useState, useEffect } from "react";
import axios from "axios";

const drawerWidth = 280;

function Sidebar({ onSearch }) {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/categories").then(res => setCategories(res.data));
    axios.get("/api/tags").then(res => setTags(res.data));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
      if (onSearch) onSearch(search);
    }
  };

  return (
    <Box sx={{ width: drawerWidth, p: 2 }}>
      <form onSubmit={handleSearch} style={{ display: "flex", marginBottom: 16 }}>
        <InputBase
          placeholder="Search…"
          fullWidth
          startAdornment={<SearchIcon sx={{ color: "#aaa", mr: 1 }} />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{
            background: "#edeff9",
            px: 2,
            py: 1,
            borderRadius: 3,
            fontSize: 16
          }}
        />
      </form>
      <Divider />
      <List
        subheader={
          <ListSubheader component="div" sx={{ display: "flex", alignItems: "center" }}>
            <CategoryIcon sx={{ mr: 1 }} /> Categories
          </ListSubheader>
        }
      >
        {categories.map((cat) => (
          <ListItem button key={cat.id} onClick={() => navigate(`/?category=${encodeURIComponent(cat.name)}`)}>
            <ListItemText primary={cat.name} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <List
        subheader={
          <ListSubheader component="div" sx={{ display: "flex", alignItems: "center" }}>
            <LabelIcon sx={{ mr: 1 }} /> Tags
          </ListSubheader>
        }
      >
        {tags.map((tag) => (
          <ListItem button key={tag.id} onClick={() => navigate(`/?tag=${encodeURIComponent(tag.name)}`)}>
            <ListItemText primary={tag.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  // Responsive sidebar rendering
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f6f7fb" }}>
      {/* AppBar */}
      <AppBar position="fixed" elevation={2} sx={{ background: "#1A237E", zIndex: 1400 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2, display: { md: "none" } }} onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography onClick={() => navigate("/")} sx={{ cursor: "pointer", display: "flex", alignItems: "center", fontWeight: 600 }}>
            <HomeIcon sx={{ mr: 1, color: "#FFB300", fontSize: 32 }} />
            IntraTech Connect
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="secondary" onClick={() => navigate("/articles/new")} sx={{ ml: 2, bgcolor: "#FFB300", color: "#222", fontWeight: 600 }}>
            Publish Article
          </Button>
          <IconButton color="inherit" sx={{ ml: 2 }} onClick={() => navigate(`/users/1`)}>
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth }
          }}
        >
          <Sidebar />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "#edeff9"
            }
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, ml: { md: drawerWidth }, mt: 8, minHeight: "calc(100vh - 64px)" }}>
        <Outlet />
        <Box component="footer" sx={{ mt: 5, textAlign: "center", color: "#888", fontSize: 15, py: 4 }}>
          © {new Date().getFullYear()} IntraTech Connect — Powered by ColorCraft. &nbsp;
          <a href="https://intranet.example.com" style={{ color: "#3949AB" }}>Company Intranet</a>
        </Box>
      </Box>
    </Box>
  );
}
