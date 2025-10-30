import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/auth/register/`, {
                username,
                email,
                password,
            });

            alert("Registration Successful! Please login.");
            navigate("/login"); // Redirect to login after successful registration
        } catch (error) {
            alert("Registration Failed: " + error.response?.data?.error || "Unknown error");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 5, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
                <Typography variant="h4" textAlign="center" mb={2}>
                    Register
                </Typography>
                <form onSubmit={handleRegister}>
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
                        label="Email"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    />
                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                        Register
                    </Button>
                </form>
                <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                    Already have an account? <Link to="/login">Login here</Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Register;
