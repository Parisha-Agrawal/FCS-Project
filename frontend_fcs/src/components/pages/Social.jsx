import React from "react";
import { Box, Typography } from "@mui/material";
import UserList from "../social/UserList";
import FriendRequestsInbox from "../social/FriendRequestsInbox";

const Social = () => {
    return (
        <Box p={2}>
        {/* <Typography variant="h4" mb={4}>Friends & Requests</Typography> */}
        {/* <FriendRequestsInbox /> */}
        <UserList />
    </Box>
    );
};

export default Social;
