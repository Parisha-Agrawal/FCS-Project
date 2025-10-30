import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    IconButton,
    FormControlLabel,
    Switch,
    MenuItem,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import Sidebar from "./Sidebar";

const Messaging = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatType, setChatType] = useState("user");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isEphemeral, setIsEphemeral] = useState(false);
    const [expiryDuration, setExpiryDuration] = useState("60");
    const [isBlocked, setIsBlocked] = useState(false);


    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const loggedInUsername = user?.username || "";
    const isVerified = user?.is_verified || false;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async () => {
        if (!selectedChat) return;

        try {
            const token = localStorage.getItem("access");
            let endpoint = "";

            if (chatType === "user") {
                endpoint = `/auth/get-messages/?username=${selectedChat}`;
            } else if (chatType === "group") {
                endpoint = `/auth/get-group-messages/${selectedChat.id}/`;
            }

            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}${endpoint}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }, [selectedChat, chatType]);
    
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getRemainingTime = (timestamp, expiresIn) => {
        const sentTime = new Date(timestamp);
        const expiryTime = new Date(sentTime.getTime() + expiresIn * 1000);
        const diff = Math.floor((expiryTime - currentTime) / 1000);
        return diff > 0 ? diff : 0;
    };


    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const checkBlockStatus = async () => {
            if (!selectedChat || chatType !== "user") return;
    
            try {
                const token = localStorage.getItem("access");
                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/auth/check-block-status/`,
                    {
                        params: { username: selectedChat },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setIsBlocked(res.data.is_blocked);
            } catch (err) {
                console.error("Error checking block status", err);
                setIsBlocked(false);
            }
        };
    
        checkBlockStatus();
    }, [selectedChat, chatType]);
    

    const handleSendMessage = async () => {
        if (isBlocked) {
            alert("You can't send messages to this user.");
            return;
        }
        
        if (!newMessage.trim() && !file) return;

        if (file && !isVerified) {
            alert("Only verified users can send media.");
            return;
        }

        try {
            const token = localStorage.getItem("access");
            const endpoint =
                chatType === "user"
                    ? "/auth/send-message/"
                    : `/auth/send-group-message/${selectedChat.id}/`;

            const formData = new FormData();

            if (chatType === "user") {
                formData.append("receiver_username", selectedChat);
            }

            if (newMessage) {
                formData.append("content", newMessage);
            }

            if (file) {
                formData.append("file", file);
            }

            if (isEphemeral) {
                formData.append("is_ephemeral", true);
                formData.append("expires_in", expiryDuration);
            }
            

            await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percent);
                },
            });

            setNewMessage("");
            setFile(null);
            setIsEphemeral(false);
            setPreviewUrl(null);
            setUploadProgress(0);
            fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleRelationshipAction = async (action, to_user_username, reason = "") => {
        try {
            const token = localStorage.getItem("access");
            const payload = {
                to_user_id: null,
                action,
                reason: action === "report" ? reason : undefined,
            };
    
            // You’ll need to fetch the user ID of `selectedChat` via backend or store it in Sidebar
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/get-user-id/?username=${to_user_username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            payload.to_user_id = res.data.id;
    
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/manage-relationship/`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            alert(response.data.message || "Action completed.");
        } catch (error) {
            console.error("Relationship action error:", error);
            alert("Error performing action.");
        }
    };
    
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        handleSelectedFile(selected);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        handleSelectedFile(droppedFile);
    };

    const handleSelectedFile = (selected) => {
        if (!selected) return;

        const allowedTypes = ["image/", "video/", "audio/", "application/pdf"];
        const isAllowed = allowedTypes.some((type) =>
            selected.type.startsWith(type)
        );

        if (!isAllowed) {
            setFileError("Unsupported file type.");
            return;
        }

        if (selected.size > 10 * 1024 * 1024) {
            setFileError("File size should be less than 10MB.");
            return;
        }

        setFileError("");
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const now = new Date();

    const filteredMessages = messages.filter((msg) => {
        const isForCurrentChat =
            chatType === "user"
                ? (msg.sender_username === loggedInUsername && msg.receiver_username === selectedChat) ||
                  (msg.sender_username === selectedChat && msg.receiver_username === loggedInUsername)
                : true;
    
        if (msg.is_ephemeral && msg.timestamp) {
            const sentTime = new Date(msg.timestamp);
            const expiresIn = msg.expires_in || 60;
            const expiresAt = new Date(sentTime.getTime() + expiresIn * 1000);
            if (now > expiresAt) return false; // hide expired
        }
    
        return isForCurrentChat;
    });

    const getChatDisplayName = () => {
        if (!selectedChat) return "";
        return chatType === "user"
            ? selectedChat
            : `Group: ${selectedChat.name}`;
    };

    return (
        <Box display="flex" height="100vh">
            <Box width="25%">
                <Sidebar
                    onSelectChat={(chatId, type) => {
                        if (type === "group" && !isVerified) {
                            alert("Please verify your account to access group chats.");
                            return;
                        }
                        setSelectedChat(chatId);
                        setChatType(type);
                    }}
                />
            </Box>

            <Box flex={1} p={4} display="flex" flexDirection="column">
                {selectedChat ? (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Chat with {getChatDisplayName()}
                        </Typography>
                        {chatType === "user" && selectedChat && (
                            <Box display="flex" justifyContent="flex-end" mb={1}>
                                <TextField
                                    select
                                    size="small"
                                    label="Actions"
                                    value=""
                                    onChange={(e) => {
                                        const action = e.target.value;
                                        if (action === "report") {
                                            const reason = prompt("Enter reason for reporting this user:");
                                            if (!reason) return;
                                            handleRelationshipAction("report", selectedChat, reason);
                                        } else {
                                            const confirmMsg =
                                                action === "block"
                                                    ? "Are you sure you want to block this user?"
                                                    : "Are you sure you want to unfriend this user?";
                                            if (window.confirm(confirmMsg)) {
                                                handleRelationshipAction(action, selectedChat);
                                            }
                                        }
                                    }}
                                    sx={{ width: 160 }}
                                >
                                    <MenuItem value="remove">Unfriend</MenuItem>
                                    <MenuItem value="block">Block</MenuItem>
                                    <MenuItem value="report">Report</MenuItem>
                                </TextField>
                            </Box>
                        )}

                        <Box
                            sx={{
                                flexGrow: 1,
                                overflowY: "auto",
                                mb: 2,
                                p: 2,
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                backgroundColor: "#fafafa",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {filteredMessages.length > 0 ? (
                                [...filteredMessages].reverse().map((msg, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            alignSelf:
                                                msg.sender_username === loggedInUsername
                                                    ? "flex-end"
                                                    : "flex-start",
                                            maxWidth: "75%",
                                            mb: 1,
                                        }}
                                    >
                                        <Paper
                                            sx={{
                                                p: 1.5,
                                                backgroundColor:
                                                    msg.sender_username === loggedInUsername
                                                        ? "#e0f7fa"
                                                        : "#fff",
                                            }}
                                        >
                                            <Typography variant="body2" color="textSecondary">
                                                {msg.sender_username}
                                            </Typography>

                                            {msg.decrypted_content && (
                                                <Typography
                                                    variant="body1"
                                                    sx={{ wordBreak: "break-word" }}
                                                >
                                                    {msg.decrypted_content}
                                                </Typography>
                                            )}

                                            {msg.media_url && (
                                                <>
                                                    {msg.media_url.match(/\.(jpeg|jpg|png|gif)$/) && (
                                                        <img
                                                            src={msg.media_url}
                                                            alt="media"
                                                            style={{ maxWidth: "100%", marginTop: 8 }}
                                                        />
                                                    )}
                                                    {msg.media_url.match(/\.(mp4|webm)$/) && (
                                                        <video
                                                            src={msg.media_url}
                                                            controls
                                                            style={{ maxWidth: "100%", marginTop: 8 }}
                                                        />
                                                    )}
                                                    {msg.media_url.match(/\.(mp3|wav)$/) && (
                                                        <audio
                                                            src={msg.media_url}
                                                            controls
                                                            style={{ marginTop: 8, width: "100%" }}
                                                        />
                                                    )}
                                                    {!msg.media_url.match(/\.(jpeg|jpg|png|gif|mp4|webm|mp3|wav)$/) && (
                                                        <a
                                                            href={msg.media_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ display: "block", marginTop: "0.5rem" }}
                                                        >
                                                            📎 View Attachment
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                                                <Typography variant="caption" color="textSecondary">
                                                    {formatTimestamp(msg.timestamp)}
                                                </Typography>
                                                {msg.is_ephemeral && (
                                                    <Typography
                                                        variant="caption"
                                                        color="error"
                                                        sx={{ ml: 1 }}
                                                    >
                                                        ⏳ {getRemainingTime(msg.timestamp, msg.expires_in || 60)}s
                                                    </Typography>
                                                )}
                                            </Box>

                                        </Paper>
                                    </Box>
                                ))
                            ) : (
                                <Typography>No messages yet.</Typography>
                            )}
                            <div ref={messagesEndRef} />
                        </Box>

                        {/* Drag & Drop + Message Input */}
                        {!isBlocked ? (
                        <Box
                            display="flex"
                            flexDirection="column"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            sx={{
                                border: "2px dashed #ccc",
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {previewUrl && (
                                <Box mb={1}>
                                    {file?.type.startsWith("image/") && (
                                        <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%" }} />
                                    )}
                                    {file?.type.startsWith("video/") && (
                                        <video src={previewUrl} controls style={{ maxWidth: "100%" }} />
                                    )}
                                    {file?.type.startsWith("audio/") && (
                                        <audio src={previewUrl} controls style={{ width: "100%" }} />
                                    )}
                                    {!["image/", "video/", "audio/"].some((t) => file?.type.startsWith(t)) && (
                                        <Typography>📎 {file?.name}</Typography>
                                    )}
                                </Box>
                            )}

                            {fileError && (
                                <Typography color="error" variant="body2">
                                    {fileError}
                                </Typography>
                            )}

                            {uploadProgress > 0 && (
                                <Typography variant="body2" color="textSecondary" mb={1}>
                                    Uploading... {uploadProgress}%
                                </Typography>
                            )}

                            <Box display="flex" alignItems="center" gap={2}>
                                <IconButton component="label" disabled={!isVerified}>
                                    <AttachFileIcon />
                                    <input type="file" hidden onChange={handleFileChange} />
                                </IconButton>

                                <TextField
                                    fullWidth
                                    label="Type a message"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                />
                                <Box display="flex" alignItems="center" gap={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={isEphemeral}
                                                onChange={(e) => setIsEphemeral(e.target.checked)}
                                            />
                                        }
                                        label="Ephemeral"
                                    />

                                    {isEphemeral && (
                                        <TextField
                                            select
                                            label="Expires In"
                                            value={expiryDuration}
                                            onChange={(e) => setExpiryDuration(e.target.value)}
                                            size="small"
                                        >
                                            <MenuItem value="10">10s</MenuItem>
                                            <MenuItem value="60">1m</MenuItem>
                                            <MenuItem value="3600">1h</MenuItem>
                                        </TextField>
                                    )}
                                </Box>

                                <Button variant="contained" onClick={handleSendMessage}>
                                    Send
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                border: "1px dashed #ccc",
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                backgroundColor: "#f5f5f5",
                                textAlign: "center",
                            }}
                        >
                            <Typography variant="body2" color="textSecondary">
                                Messaging disabled. You cannot chat with this user because one of you has blocked the other.
                            </Typography>
                        </Box>
                    )}

                    </>
                ) : (
                    <Typography variant="h6">
                        Select a user or group to start messaging
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default Messaging;
