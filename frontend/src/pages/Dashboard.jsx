import DashboardNavigation from "../components/layout/DashboardNavigation";
import RoleProtection from "../components/security/RoleProtection";
import { useNavigate } from "react-router-dom";
import React from "react";
import Card from 'react-bootstrap/Card';
import menuImage from "../assets/menu.png"; 
/* This page is the first page the staff sees when they log in */

function DashboardPage({ user }) {
  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      <DashboardNavigation />
      <h1 className="text-3xl font-semibold text-gray-800 text-center mt-6">
        Welcome {user?.username || "Staff"}
      </h1>

      {/* Bootstrap Menu Management Card */}
      <MenuManagementCard />
    </div>
  );
}

/* Clickable Bootstrap Card for Menu Management */
const MenuManagementCard = () => {
  const navigate = useNavigate();

  return (
    <Card style={{ width: '18rem', cursor: 'pointer' }} className="mt-5 shadow-lg" onClick={() => navigate("/menu-management")}>
      <Card.Img variant="top" src={menuImage} style={{ width: "250px", height: "250px", objectFit: "cover" }}/>
    </Card>
  );
};

export default RoleProtection(DashboardPage, ["S", "M", "E"]);
