import React, { useState, useEffect } from "react";
import { Box, Drawer } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(
        localStorage.getItem("sidebarOpen") === "true"
    );

    useEffect(() => {
        localStorage.setItem("sidebarOpen", sidebarOpen);
    }, [sidebarOpen]);

    return (
        <Box sx={{ display: "flex" }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                open={sidebarOpen}
                sx={{
                    width: sidebarOpen ? 200 : 60,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: sidebarOpen ? 200 : 60,
                        transition: "width 0.3s",
                    },
                }}
            >
                <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            </Drawer>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, ml: sidebarOpen ? "200px" : "60px", transition: "margin 0.3s" }}>
                <Header />
                <Box sx={{ p: 3 }}>{children}</Box>
            </Box>
        </Box>
    );
};

export default Layout;
