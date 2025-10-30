import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");
  const [error, setError] = useState(null);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Invalid username or password. Please try again.");
      }

      localStorage.setItem("adminToken", data.access);
      await fetchUsers(data.access); // Fetch users before redirecting

    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!adminToken) {
        navigate("/admin/login");
        return;
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/users/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // console.log("Fetched Users:", data);
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load users. Please try again later.");
        }
    };

    fetchUsers();
}, [adminToken, navigate]);

  const fetchUsers = async (adminToken) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("Fetched Users:", data);
      setUsers(data);
      navigate("/admin/dashboard"); // Redirect after fetching users
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Admin Login
        </Typography>
        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
        <form onSubmit={handleAdminLogin}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default AdminLogin;
