import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import UpdateProfile from "./components/UpdateProfile";
import Messaging from "./components/messaging/Messaging";
import GroupMessaging from "./components/messaging/GroupMessaging"; 
import GroupChat from "./components/messaging/GroupChat"; 
import Header from "./components/Header";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import { PrivateRoute, AdminRoute } from "./utils/privateRoute";

import Marketplace from "./components/marketplace/Marketplace";
import MarketplacePayment from "./components/marketplace/MarketplacePayment";
import FriendRequestsInbox from "./components/social/FriendRequestsInbox";
import UserList from "./components/social/UserList"; 
import Social from "./components/pages/Social";

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
                <Route path="/update-profile" element={<PrivateRoute element={<UpdateProfile />} />} />
                <Route path="/messages" element={<PrivateRoute element={<Messaging />} />} />
                <Route path="/group-messages" element={<PrivateRoute element={<GroupMessaging />} />} />
                <Route path="/group-chat/:groupId" element={<PrivateRoute element={<GroupChat />} />} />

                <Route path="/marketplace" element={<PrivateRoute element={<Marketplace />} />} />
                <Route path="/marketplace/payment/:productId" element={<PrivateRoute element={<MarketplacePayment />} />} />
             
                <Route path="/explore-users" element={<PrivateRoute element={<UserList />} />} />
                <Route path="/auth/friend-requests" element={<PrivateRoute element={<FriendRequestsInbox />} />} />
                <Route path="/social" element={<PrivateRoute element={<Social />}/>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />

            </Routes>
        </Router>
    );
}

export default App;
