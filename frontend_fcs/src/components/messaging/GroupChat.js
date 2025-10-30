import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
    Button,
    TextField,
    Box,
    Typography,
    List,
    ListItem,
    Card,
    CardContent,
} from "@mui/material";

const GroupChat = () => {
    const { groupId } = useParams();
    const [setGroups] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [media, setMedia] = useState(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Wrap the fetchGroups function in useCallback and include setGroups as dependency
    const fetchGroups = useCallback(async () => {
        try {
            const token = localStorage.getItem("access");
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/get-groups/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGroups(response.data);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    }, [setGroups]);  // Add setGroups as a dependency

    const fetchMessages = useCallback(async () => {
        if (!groupId) return;
        try {
            const token = localStorage.getItem("access");
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/auth/get-group-messages/${groupId}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }, [groupId]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);  // Add fetchGroups to dependencies

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() && !media) return;

        try {
            const token = localStorage.getItem("access");
            const formData = new FormData();
            formData.append("content", message);
            if (media) formData.append("media", media);

            await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/send-group-message/${groupId}/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setMessage("");
            setMedia(null);
            fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}>
                {groupId ? (
                    <>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Group Chat
                        </Typography>

                        {/* Message List */}
                        <Box sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "60vh", mb: 2 }}>
                            <List>
                                {messages.length > 0 ? (
                                    messages.slice().reverse().map((msg) => (
                                        <ListItem key={msg.id} sx={{ justifyContent: "flex-start", mb: 1 }}>
                                            <Card sx={{ p: 2, maxWidth: "70%", backgroundColor: "#f5f5f5" }}>
                                                <CardContent>
                                                    <Typography variant="body1" fontWeight="bold" color="primary">
                                                        {msg.sender_username || "Unknown"}
                                                    </Typography>
                                                    <Typography variant="body2">{msg.decrypted_content}</Typography>
                                                    <Typography variant="caption" sx={{ display: "block", mt: 1, color: "gray" }}>
                                                        {new Date(msg.timestamp).toLocaleString()}
                                                    </Typography>

                                                    {msg.media_url && (
                                                        <Box sx={{ mt: 1 }}>
                                                            {msg.media_url.endsWith(".mp4") ? (
                                                                <video src={msg.media_url} width="200" controls />
                                                            ) : (
                                                                <img src={msg.media_url} alt="Media" width="200" />
                                                            )}
                                                        </Box>
                                                    )}

                                                </CardContent>
                                            </Card>
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography sx={{ color: "gray", textAlign: "center", mt: 2 }}>
                                        No messages yet. Start a conversation!
                                    </Typography>
                                )}
                                <div ref={messagesEndRef} />
                            </List>
                        </Box>

                        {/* Send Message */}
                        <form onSubmit={sendMessage}>
                            <TextField
                                label="Type a message..."
                                fullWidth
                                multiline
                                rows={2}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required={!media}
                                sx={{ mb: 2 }}
                            />

                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => setMedia(e.target.files[0])}
                                style={{ display: "block", marginBottom: "10px" }}
                            />

                            {media && (
                                <Box sx={{ mb: 2 }}>
                                    {media.type.startsWith("video") ? (
                                        <video src={URL.createObjectURL(media)} width="200" controls />
                                    ) : (
                                        <img
                                            src={URL.createObjectURL(media)}
                                            alt="Preview"
                                            width="200"
                                            style={{ borderRadius: "8px" }}
                                        />
                                    )}
                                    <Button variant="outlined" color="error" onClick={() => setMedia(null)} sx={{ ml: 2 }}>
                                        Remove
                                    </Button>
                                </Box>
                            )}

                            <Button type="submit" variant="contained" color="primary">
                                Send
                            </Button>
                        </form>
                    </>
                ) : (
                    <Typography variant="h6" textAlign="center" mt={5}>
                        Select a group from the sidebar to start chatting.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default GroupChat;
