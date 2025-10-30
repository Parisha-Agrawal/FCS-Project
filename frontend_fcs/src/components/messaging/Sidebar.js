
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tooltip,
    Divider,
} from "@mui/material";
import {
    Add as AddIcon,
    GroupAdd as GroupAddIcon,
    Chat as ChatIcon
} from "@mui/icons-material";

const Sidebar = ({ onSelectChat }) => {
    const [conversations, setConversations] = useState([]);
    const [groups, setGroups] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUsernames, setSelectedUsernames] = useState("");
    const [newChatUsername, setNewChatUsername] = useState("");
    const [openNewChatDialog, setOpenNewChatDialog] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const loggedInUsername = user?.username || "";
    const isVerified = user?.is_verified || false;

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/get-messages/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const uniqueUsers = [
                    ...new Set(
                        response.data.map((msg) =>
                            msg.sender_username === loggedInUsername
                                ? msg.receiver_username
                                : msg.sender_username
                        )
                    ),
                ];
                setConversations(uniqueUsers);
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };

        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/user-groups/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGroups(response.data);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        };

        fetchMessages();
        fetchGroups();
    }, [loggedInUsername]);

    const createGroup = async () => {
        if (!groupName.trim() || !selectedUsernames.trim()) {
            alert("Please enter a group name and at least one username.");
            return;
        }

        const usernames = selectedUsernames
            .split(",")
            .map((name) => name.trim())
            .filter((name) => name);

        const token = localStorage.getItem("access");

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/create-group/`,
                {
                    name: groupName,
                    members: usernames,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Group created successfully!");
            if (response.data.warning) {
                alert(`Warning: ${response.data.warning}`);
            }

            setOpenDialog(false);
            setGroupName("");
            setSelectedUsernames("");

            const groupsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/auth/user-groups/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGroups(groupsResponse.data);

        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create group. Please check the usernames and try again.");
        }
    };

    const startNewChat = () => {
        if (!newChatUsername.trim()) {
            alert("Please enter a username.");
            return;
        }
        setConversations((prev) => [...new Set([...prev, newChatUsername])]);
        setOpenNewChatDialog(false);
    };

    const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?';

    return (
        <Box 
            sx={{
                width: "85%",
                height: "100vh",
                p: 2,
                borderRight: "1px solid #ddd",
                backgroundColor: "#f9fafb",
                overflowY: "auto",
            }}
        >
            {/* Header */}
            <Box  display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                    Messages
                </Typography>
                <IconButton size="small" onClick={() => setOpenNewChatDialog(true)}>
                    <ChatIcon />
                </IconButton>
            </Box>

            {/* User Chats */}
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Direct Chats
            </Typography>
            <List dense>
                {conversations.length > 0 ? (
                    conversations.map((user, index) => (
                        <ListItem
                            button
                            key={index}
                            onClick={() => onSelectChat(user, "user")}
                            sx={{
                                borderRadius: 2,
                                mb: 1,
                                px: 2,
                                "&:hover": { backgroundColor: "#e3f2fd" },
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar>{getInitials(user)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={user} />
                        </ListItem>
                    ))
                ) : (
                    <Typography fontSize="0.9rem" color="gray">No conversations yet.</Typography>
                )}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Groups */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                    Group Chats
                </Typography>
                <Tooltip title={isVerified ? "Create a new group" : "Only verified users can create groups"}>
                    <span>
                        <IconButton
                            onClick={() => {
                                if (!isVerified) {
                                    alert("You must verify your email before creating a group.");
                                    return;
                                }
                                setOpenDialog(true);
                            }}
                            disabled={!isVerified}
                            size="small"
                        >
                            <GroupAddIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
            <List dense>
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <ListItem
                            key={group.id}
                            button
                            onClick={() => onSelectChat({ id: group.id, name: group.name }, "group")}
                            sx={{
                                borderRadius: 2,
                                mb: 1,
                                px: 2,
                                "&:hover": { backgroundColor: "#e8f5e9" },
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "#66bb6a" }}>
                                    {getInitials(group.name)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={group.name} />
                        </ListItem>
                    ))
                ) : (
                    <Typography fontSize="0.9rem" color="gray">No groups yet. Create one!</Typography>
                )}
            </List>

            {/* Group Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create a New Group</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Usernames (comma-separated)"
                        value={selectedUsernames}
                        onChange={(e) => setSelectedUsernames(e.target.value)}
                        helperText="Enter usernames of members, separated by commas."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
                    <Button onClick={createGroup} color="primary" variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* New Chat Dialog */}
            <Dialog open={openNewChatDialog} onClose={() => setOpenNewChatDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Start New Chat</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Enter Username"
                        value={newChatUsername}
                        onChange={(e) => setNewChatUsername(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewChatDialog(false)} color="secondary">Cancel</Button>
                    <Button onClick={startNewChat} color="primary" variant="contained">Start Chat</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Sidebar;
