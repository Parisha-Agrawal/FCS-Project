import React, { useState } from "react";
import { AppBar, Toolbar, Tooltip, Typography, IconButton, Avatar, Menu, MenuItem, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MailIcon from "@mui/icons-material/Mail";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        logout();
        navigate("/login");
    };

    return (
        <AppBar position="static" sx={{ bgcolor: "primary.main", boxShadow: 3 }}>
            <Toolbar>
                <Typography 
                    variant="h6" 
                    sx={{ flexGrow: 1, cursor: "pointer", fontWeight: "bold" }} 
                    onClick={() => navigate("/dashboard")}
                >
                    {/* Social Media App */}
                    AegisLinq
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Tooltip title="Explore Users">
                        {/* <IconButton color="inherit" onClick={() => navigate("/explore-users")}> */}
                        <IconButton color="inherit" onClick={() => navigate("/social")}>
                            <PeopleAltIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chat">
                    <IconButton color="inherit" onClick={() => navigate("/messages")}>
                        <MailIcon />
                    </IconButton>
                    </Tooltip>
                    
                    {/* New Marketplace Icon */}
                    <Tooltip title="Marketplace">
                    <IconButton color="inherit" onClick={() => navigate("/marketplace")}>
                        <ShoppingCartIcon />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Profile">
                    <IconButton onClick={handleMenuOpen} color="inherit">
                        <Avatar 
                            sx={{ width: 32, height: 32, bgcolor: "secondary.main" }} 
                            src={user?.profile_picture || ""}
                        >
                            {!user?.profile_picture && (user?.username?.charAt(0).toUpperCase() || "U")}
                        </Avatar>
                    </IconButton>
                    </Tooltip>
                    
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem onClick={() => { navigate("/profile"); handleMenuClose(); }}>Profile</MenuItem>
                        <MenuItem onClick={() => { navigate("/update-profile"); handleMenuClose(); }}>Update Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
