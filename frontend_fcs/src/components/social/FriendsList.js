import React from "react";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, Typography, Box } from "@mui/material";
import axios from "axios";

const FriendsList = ({ friends, setFriends }) => {
    const token = localStorage.getItem("access");
    

    const removeFriend = async (id) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/auth/remove-friend/`, {
                friend_id: id,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updated = friends.filter(friend => friend.id !== id);
            setFriends(updated);
        } catch (err) {
            console.error("Error removing friend", err);
        }
    };

    return (
        <Box mt={4}>
            <Typography variant="h6" mb={2}>Your Friends</Typography>
            <List>
                {friends.length === 0 && (
                    <Typography variant="body2" color="textSecondary">No friends yet</Typography>
                )}
                {friends.map(friend => (
                    <ListItem key={friend.id} divider>
                        <ListItemAvatar>
                            <Avatar>{friend.username[0].toUpperCase()}</Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={friend.username} />
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => removeFriend(friend.id)}
                        >
                            Remove Friend
                        </Button>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default FriendsList;
