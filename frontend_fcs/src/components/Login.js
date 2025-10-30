import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, IconButton, InputAdornment, CircularProgress, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login/`, {
                username,
                password,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            login(response.data.user);

            // alert("Login Successful!");
            navigate("/dashboard");
        } catch (error) {
            setError(error.response?.data?.error || "Login failed. Please try again.");
        }
         finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 5, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
                <Typography variant="h4" textAlign="center" mb={2}>
                    Login
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
                    </Button>
                </form>
                <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                    Don't have an account? <Link to="/register">Register here</Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;
