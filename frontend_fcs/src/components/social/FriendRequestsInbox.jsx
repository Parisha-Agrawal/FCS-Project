import React from "react";
import { List, ListItem, Button, Typography, ListItemText } from "@mui/material";
import axios from "axios";

const FriendRequestsInbox = ({ requests, setRequests, setFriends }) => {
    const token = localStorage.getItem("access");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const incomingRequests = requests.filter(
        (req) => req.to_user?.username === currentUser.username
      );
      

      const respondToRequest = async (id, uname, action) => {
        try {
            if (action === "accept") {
                await axios.post(`${process.env.REACT_APP_API_URL}/auth/accept-friend-request/`, {
                    from_id: id,
                    from_username: uname
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // await axios.post(`${process.env.REACT_APP_API_URL}/auth/accept-friend-request/`, {}, {
                //     headers: { Authorization: `Bearer ${token}` },
                // });
                
    
                // Refresh friends list from backend
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/list-friends/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFriends(res.data);
    
            } else {
                // await axios.post(`${process.env.REACT_APP_API_URL}/auth/decline-friend-request/`, {
                //     from_id: id,
                //     from_username: uname
                // }, {
                //     headers: { Authorization: `Bearer ${token}` },
                // });
                await axios.post(`${process.env.REACT_APP_API_URL}/auth/decline-friend-request/${id}/`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
            }
    
            // Remove the request from inbox after response
            setRequests(prev => prev.filter(req => req.id !== id));
    
        } catch (err) {
            console.error("Error responding to friend request", err);
        }
    };
    

    return (
        <>
            <Typography variant="h6" mb={2}>Incoming Friend Requests</Typography>
           
            <List>
                {incomingRequests.length === 0 && (
                    <Typography variant="body2" color="textSecondary">No new friend requests</Typography>
                )}
                {incomingRequests.map((req) => (
                    <ListItem key={req.id} divider>
                    <ListItemText primary={req.from_user.username} />
                    <Button
                        variant="contained"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => respondToRequest(req.id, req.from_user.username, "accept")}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => respondToRequest(req.id, req.from_user.username, "decline")}
                    >
                        Decline
                    </Button>
                    </ListItem>
                ))}
            </List>

        </>
    );
};

export default FriendRequestsInbox;
