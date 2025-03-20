import DashboardNavigation from "../components/layout/DashboardNavigation";
import RoleProtection from "../components/security/RoleProtection";
import { useNavigate } from "react-router-dom";
import React from "react";
import Card from "react-bootstrap/Card";
import menuImage from "../assets/menu.png";
import orderImage from "../assets/order.png"; 

/* This page is the first page the staff sees when they log in */
function DashboardPage({ user }) {
  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      <DashboardNavigation />
      <h1 className="text-3xl font-semibold text-gray-800 text-center mt-6">
        Welcome {user?.username || "Staff"}
      </h1>

      <div className="flex gap-6 mt-5">
        <MenuManagementCard />
        <OrderManagementCard />
      </div>
    </div>
  );
}

/* Clickable Bootstrap Card for Menu Management */
const MenuManagementCard = () => {
  const navigate = useNavigate();
  return (
    <Card style={{ width: "18rem", cursor: "pointer" }} className="shadow-lg" onClick={() => navigate("/menu-management")}>
      <Card.Img variant="top" src={menuImage} style={styles.cardImage} />
      <Card.Body>
        <Card.Title className="text-center">Menu Management</Card.Title>
      </Card.Body>
    </Card>
  );
};

/* Clickable Bootstrap Card for Order Management */
const OrderManagementCard = () => {
  const navigate = useNavigate();
  return (
    <Card style={{ width: "18rem", cursor: "pointer" }} className="shadow-lg" onClick={() => navigate("/orders")}>
      <Card.Img variant="top" src={orderImage} style={styles.cardImage} />
      <Card.Body>
        <Card.Title className="text-center">Order Management</Card.Title>
      </Card.Body>
    </Card>
  );
};

const styles = {
  cardImage: {
    width: "250px",
    height: "250px",
    objectFit: "cover",
  },
};

export default RoleProtection(DashboardPage, ["S", "M", "E"]);
