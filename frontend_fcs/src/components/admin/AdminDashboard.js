
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
} from "@mui/material";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);


  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/admin/users/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError("Failed to load users. Please try again later.");
      }
    };

    fetchUsers();
  }, [adminToken, navigate]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/reports/`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
  
      if (!res.ok) throw new Error();
  
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError("Failed to load user reports.");
    }
  };
  
  fetchReports();
  
  const handleVerification = async (userId, status) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/users/verify/${userId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user verification.");
      }

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, is_verified: status === "approve" ? true : false }
            : user
        )
      );
    } catch (error) {
      setError("Failed to update verification status.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Typography variant="h6" gutterBottom>
        Users List
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .filter((user) => !user.is_superuser)
              .sort((a, b) => a.id - b.id)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>{user.is_verified ? "✅ Verified" : "❌ Not Verified"}</TableCell>
                  <TableCell>
                    {!user.is_verified ? (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleVerification(user.id, "approve")}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleVerification(user.id, "reject")}
                      >
                        Revoke Verification
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        User Reports
      </Typography>

      {reports.length > 0 ? (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>From User</TableCell>
                <TableCell>To User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell>{rep.id}</TableCell>
                  <TableCell>{rep.from_user}</TableCell>
                  <TableCell>{rep.to_user}</TableCell>
                  <TableCell>{rep.action}</TableCell>
                  <TableCell>{rep.reason || "N/A"}</TableCell>
                  <TableCell>{new Date(rep.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No reports found.</Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        }}
        sx={{ mt: 3 }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default AdminDashboard;
