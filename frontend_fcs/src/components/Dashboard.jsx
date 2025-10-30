import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    Button,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GppBadIcon from "@mui/icons-material/GppBad";

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <Box sx={{ p: 4, mt: 8 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Hello, {user?.username || "User"} 👋
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Welcome to AegisLinq – your secure space for conversations, connections and marketplace
            </Typography>
            <Grid container spacing={3} mt={2}>
                {[
                    {
                        title: "Verification Status",
                        icon: user?.is_verified ? <VerifiedUserIcon /> : <GppBadIcon />,
                        bgcolor: user?.is_verified ? "green" : "red",
                        content: user?.is_verified
                            ? "You're verified! Enjoy full access."
                            : "You are not verified yet. Complete verification to unlock all features.",
                        button: !user?.is_verified && {
                            text: "Verify Now",
                            path: "/verify",
                            variant: "contained"
                        }
                    },
                    {
                        title: "Your Profile",
                        icon: <PersonIcon />,
                        bgcolor: "#3f51b5",
                        content: "Update your profile picture, bio, and personal info anytime.",
                        button: {
                            text: "Edit Profile",
                            path: "/profile",
                            variant: "outlined"
                        }
                    },
                    {
                        title: "Messages",
                        icon: <MessageIcon />,
                        bgcolor: "#009688",
                        content: "Start chatting securely with your contacts or join group discussions.",
                        button: {
                            text: "Go to Messages",
                            path: "/messages",
                            variant: "outlined"
                        }
                    },
                    {
                        title: "Marketplace",
                        icon: <StorefrontIcon />,
                        bgcolor: "#ff9800",
                        content: "Browse or list items, and buy securely with end-to-end trust.",
                        button: {
                            text: "Visit Marketplace",
                            path: "/marketplace",
                            variant: "outlined"
                        }
                    }
                ].map((section, i) => (
                    <Grid item xs={12} sm={6} md={6} key={i}>
                        <Card
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                height: "100%",
                                minHeight: 200,
                                p: 2
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Avatar sx={{ bgcolor: section.bgcolor, mr: 2 }}>
                                    {section.icon}
                                </Avatar>
                                <Typography variant="h6">{section.title}</Typography>
                            </Box>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography color="text.secondary">
                                    {section.content}
                                </Typography>
                            </CardContent>
                            {section.button && (
                                <Button
                                    size="small"
                                    variant={section.button.variant}
                                    sx={{ mt: 1 }}
                                    onClick={() => handleNavigate(section.button.path)}
                                >
                                    {section.button.text}
                                </Button>
                            )}
                        </Card>
                    </Grid>
                ))}
            </Grid>

        </Box>
    );
};

export default Dashboard;
