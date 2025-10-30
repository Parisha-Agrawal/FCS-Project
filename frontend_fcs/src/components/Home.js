import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, Stack } from "@mui/material";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        textAlign: "center" 
      }}
    >
      <Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to AegisLinq
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          A secure connection for social interactions and transactions.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Choose an option to continue
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="contained" 
            onClick={() => navigate("/register")} 
            sx={{ backgroundColor: "#ff9900", "&:hover": { backgroundColor: "#e68a00" } }}
          >
            Register
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate("/login")} 
            sx={{ backgroundColor: "#0073e6", "&:hover": { backgroundColor: "#005bb5" } }}
          >
            Login
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Home;
