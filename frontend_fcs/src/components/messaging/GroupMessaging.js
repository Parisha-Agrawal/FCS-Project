import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const GroupMessaging = () => {
    const [groups, setGroups] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

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

    const createGroup = async () => {
        if (!groupName.trim() || !selectedUserIds.trim()) {
            alert("Please enter a group name and at least one user ID.");
            return;
        }

        const memberIds = selectedUserIds
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);

        if (memberIds.length === 0) {
            alert("Please provide at least one valid user ID.");
            return;
        }

        try {
            const token = localStorage.getItem("access");
            await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/create-group/`,
                { name: groupName, members: memberIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Group created successfully!");
            setOpenDialog(false);
            setGroupName("");
            setSelectedUserIds("");
            fetchGroups();
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create group. Please check the user IDs.");
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Group Messaging</Typography>

            <Button
                variant="contained"
                color="primary"
                sx={{ mb: 3 }}
                onClick={() => setOpenDialog(true)}
            >
                Create New Group
            </Button>

            <Typography variant="h6" gutterBottom>Your Groups:</Typography>
            <List>
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <ListItem
                            key={group.id}
                            button
                            onClick={() => navigate(`/group-chat/${group.id}`)}
                        >
                            <Typography>{group.name}</Typography>
                        </ListItem>
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No groups found. Create one!
                    </Typography>
                )}
            </List>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Create a New Group</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="User IDs (comma-separated)"
                        value={selectedUserIds}
                        onChange={(e) => setSelectedUserIds(e.target.value)}
                        helperText="Enter user IDs separated by commas (e.g. 1, 2, 3)"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={createGroup} color="primary" variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GroupMessaging;