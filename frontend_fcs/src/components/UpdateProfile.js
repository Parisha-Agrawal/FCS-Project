
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Box,
  Paper,
  Avatar,
} from "@mui/material";

const UpdateProfile = () => {
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();


  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let token = localStorage.getItem("access");

    if (!token) {
      setError("You must be logged in to update your profile.");
      setLoading(false);
      navigate("/login");
      return;
    }

    const formData = new FormData();
    if (username) formData.append("username", username);
    if (profilePicture) formData.append("profile_picture", profilePicture);

    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/auth/update_profile/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      await refreshUser();
      navigate("/profile");
    } catch (error) {
      setError(error.response?.data?.error || "Failed to update profile.");
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={6} sx={{ mt: 5, p: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          Update Profile
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {preview && <Avatar src={preview} sx={{ width: 100, height: 100, mx: "auto", my: 2 }} />}

        <Box component="form" onSubmit={handleUpdate} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="New Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Button variant="contained" component="label">
            Upload Profile Picture
            <input type="file" hidden onChange={handleFileChange} />
          </Button>

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading || (!username && !profilePicture)}>
            {loading ? <CircularProgress size={24} /> : "Update Profile"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UpdateProfile;
