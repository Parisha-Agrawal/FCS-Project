import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, CircularProgress, Container, Typography, Box, Avatar } from "@mui/material";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [relationshipStatus, setRelationshipStatus] = useState(null);
    const [profileStats, setProfileStats] = useState({ followers: 0, following: 0 });
    const handleFollow = async () => {
        const token = localStorage.getItem("access");
        await axios.post(`${process.env.REACT_APP_API_URL}/api/relationships/`, {
            to_user: user.id,
            status: "following",
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setRelationshipStatus({ status: "following" });
    };
    
    const handleUnfollow = async () => {
        const token = localStorage.getItem("access");
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/relationships/${relationshipStatus.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setRelationshipStatus(null);
    };
    
    const handleBlock = async () => {
        const token = localStorage.getItem("access");
        await axios.post(`${process.env.REACT_APP_API_URL}/api/relationships/`, {
            to_user: user.id,
            status: "blocked",
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setRelationshipStatus({ status: "blocked" });
    };
    
    const handleUnblock = async () => {
        const token = localStorage.getItem("access");
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/relationships/${relationshipStatus.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setRelationshipStatus(null);
    };
    
    const handleSendFriendRequest = async () => {
        const token = localStorage.getItem("access");
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/send-friend-request/`, {
            to_username: user.username,
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setRelationshipStatus({ status: "requested" });
    };
    
    const handleAcceptFriendRequest = async () => {
        const token = localStorage.getItem("access");
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/accept-friend-request/`, {
            from_username: user.username,
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setRelationshipStatus({ status: "friends" });
    };
    
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("access");

            if (!token) {
                alert("User not logged in!");
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/profile/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                alert("Failed to fetch profile");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        const fetchRelationshipStatus = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/relationships/status/?to_user=${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRelationshipStatus(response.data); // { status: "following" } or null
            } catch (err) {
                console.error("Relationship status error", err);
            }
        };
    
        const fetchProfileStats = async () => {
            try {
                const token = localStorage.getItem("access");
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/profile/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfileStats({
                    followers: res.data.followers_count,
                    following: res.data.following_count,
                });
            } catch (err) {
                console.error("Error loading stats", err);
            }
        };
    
        if (user) {
            fetchRelationshipStatus();
            fetchProfileStats();
        }
    }, [user]);

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="sm">
            <Box textAlign="center" mt={5} p={3} border="1px solid #ccc" borderRadius={2}>
                <Typography variant="h4">Profile</Typography>
                {user && (
                    <>
                        <Avatar src={user.profile_picture} sx={{ width: 80, height: 80, mx: "auto", my: 2 }} />
                        <Typography><strong>Username:</strong> {user.username}</Typography>
                        <Typography><strong>Email:</strong> {user.email}</Typography>
                        <Typography><strong>Followers:</strong> {profileStats.followers}</Typography>
                        <Typography><strong>Following:</strong> {profileStats.following}</Typography>
                        {/* Only show if profile being viewed is not the logged-in user */}
                        {user.username !== JSON.parse(localStorage.getItem("user"))?.username && (
                            <>
                                
                                {relationshipStatus?.status === "following" ? (
                                    <Button
                                        variant="outlined"
                                        sx={{ mt: 2, mr: 1 }}
                                        onClick={handleUnfollow}
                                    >
                                        Unfollow
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        sx={{ mt: 2, mr: 1 }}
                                        onClick={handleFollow}
                                    >
                                        Follow
                                    </Button>
                                )}

                                {relationshipStatus?.status === "blocked" ? (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        sx={{ mt: 2 }}
                                        onClick={handleUnblock}
                                    >
                                        Unblock
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        sx={{ mt: 2 }}
                                        onClick={handleBlock}
                                    >
                                        Block
                                    </Button>
                                )}
                            </>
                        )}

                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={() => navigate("/update-profile")}
                        >
                            Update Profile
                        </Button>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default Profile;
