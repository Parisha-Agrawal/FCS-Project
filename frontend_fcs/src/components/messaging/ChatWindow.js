import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, List, ListItem, TextField, Button } from "@mui/material";

const ChatWindow = ({ chat }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchMessages();
    }, [chat]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("access");
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/get-messages/${chat.username}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("access");
            await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/send-message/`,
                { receiver_username: chat.username, content: message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("");
            fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };    

    return (
        <Box>
            <Typography variant="h6">Chat with {chat.username}</Typography>

            {/* Display Messages */}
            <List>
                {messages.map((msg) => (
                    <ListItem key={msg.id} alignItems="flex-start">
                        <Box>
                            <Typography>
                                <strong>{msg.sender_username}</strong>: {msg.decrypted_content}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {msg.formatted_timestamp}
                            </Typography>
                        </Box>
                    </ListItem>
                ))}
            </List>

            {/* Send Message Form */}
            <form onSubmit={sendMessage}>
                <TextField
                    label="Type a message..."
                    fullWidth
                    multiline
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    sx={{ mt: 2 }}
                />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>
                    Send
                </Button>
            </form>
        </Box>
    );
};

export default ChatWindow;
