import DashboardNavigation from "../components/layout/DashboardNavigation";
import RoleProtection from "../components/security/RoleProtection";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import React from "react";
import Card from "react-bootstrap/Card";
import menuImage from "../assets/menu.png";
import sales from "../assets/growing.png";
/* This page is the first page the staff sees when they log in */

function DashboardPage({ user }) {
  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      <DashboardNavigation />
      <h1 className="text-3xl font-semibold text-gray-800 text-center mt-6">
        {user?.username || "Staff"}'s Dashboard
      </h1>
      {/* Add appropriate cards below */}
      <div className="dashboard-grid">
        <NavigationCard
          image={menuImage}
          title="Menu Management"
          navigateTo="/menu-management"
        />
        <NavigationCard
          image={sales}
          title="Sales Analysis"
          navigateTo="/dashboard"
        />
      </div>
    </div>
  );
}

/* Reusable Navigation Card Component */
const NavigationCard = ({ image, title, navigateTo }) => {
  const navigate = useNavigate();

  return (
    <Card
      style={{
        width: "18rem",
        cursor: "pointer",
        textAlign: "center",
        marginBottom: "20px",
        padding: "10px" /* Add some padding inside the card */,
        border: "1px solid #e2e8f0" /* Subtle border */,
        borderRadius: "8px" /* Rounded corners */,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" /* Soft shadow */,
        backgroundColor: "#fff" /* Add this line to set a white background */,
      }}
      className="mt-5 shadow-lg"
      onClick={() => navigate(navigateTo)}
    >
      <Card.Img
        variant="top"
        src={image}
        style={{ width: "250px", height: "250px", objectFit: "contain" }}
      />
      <Card.Body>
        <Card.Text className="card-title">{title}</Card.Text>
      </Card.Body>
    </Card>
  );
};

const styles = {
  reservationButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#FF8C42",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "1rem",
  },
};
export default RoleProtection(DashboardPage, ["S", "M", "E"]);
