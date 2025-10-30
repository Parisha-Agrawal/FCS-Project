import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  TextField,
  Typography,
  Box
} from "@mui/material";
import FriendRequestsInbox from "./FriendRequestsInbox";
import FriendsList from "./FriendsList";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingActions, setPendingActions] = useState({});

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchFriends();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/friend-requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Error loading friend requests", err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/list-friends/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data);
    } catch (err) {
      console.error("Error loading friends list", err);
    }
  };

  const handleFriendRequest = async (username) => {
    const hasPendingRequest = requests.some(req =>
      (req.from_user.username === username && req.to_user?.username === currentUser.username) || 
      (req.to_user?.username === username && req.from_user.username === currentUser.username)
    );
  
    const isAlreadyFriend = friends.some(f => f.username === username);
  
    if (hasPendingRequest || isAlreadyFriend) {
      alert("You're already friends or a request is pending.");
      return;
    }
  
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/send-friend-request/`, {
        to_username: username
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const newRequest = {
        id: res.data.id,
        from_user: { username: currentUser.username },
        to_user: { username },
      };
  
      setRequests(prev => [...prev, newRequest]);
      alert(`Friend request sent to ${username}`);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };
  

  const cancelFriendRequest = async (requestId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/friend-requests/${requestId}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("Error cancelling friend request:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <FriendRequestsInbox requests={requests} setRequests={setRequests} setFriends={setFriends} />

      <Box mt={4}>
        <Typography variant="h6" mb={2}>Explore Users</Typography>
        <TextField
          fullWidth
          label="Search by username or bio"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        <List>
          {filteredUsers.map(user => {
            if (user.username === currentUser?.username) return null;

            const outgoingRequest = requests.find(
              req => req.to_user?.username === user.username && req.from_user?.username === currentUser.username
            );

            const alreadyFriend = friends.some(f => f.username === user.username);

            const handleToggleFriend = async () => {
              if (pendingActions[user.username]) return;
              setPendingActions(prev => ({ ...prev, [user.username]: true }));

              try {
                if (outgoingRequest) {
                  await cancelFriendRequest(outgoingRequest.id);
                } else {
                  await handleFriendRequest(user.username);
                }
              } catch (error) {
                console.error(error);
              } finally {
                setPendingActions(prev => ({ ...prev, [user.username]: false }));
              }
            };

            return (
              <ListItem key={user.id} divider>
                <ListItemAvatar>
                  <Avatar>{user.username[0].toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.username} secondary={user.bio || "No bio"} />
                {alreadyFriend ? (
                  <Button variant="contained" size="small" disabled>
                    Friends
                  </Button>
                ) : outgoingRequest ? (
                  <Button variant="outlined" size="small" disabled>
                    Request Sent
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleToggleFriend}
                    disabled={pendingActions[user.username]}
                  >
                    Add Friend
                  </Button>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      <FriendsList friends={friends} setFriends={setFriends} />
    </Box>
  );
};

export default UserList;
