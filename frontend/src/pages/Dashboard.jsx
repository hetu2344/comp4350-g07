import DashboardNavigation from "../components/layout/DashboardNavigation";
import RoleProtection from "../components/security/RoleProtection";
import { useNavigate } from "react-router-dom";
import React from "react";
import Card from "react-bootstrap/Card";
import menuImage from "../assets/menu.png";
import orderImage from "../assets/order.png";
import ticket from "../assets/ticket.png";
import orderHistory from"../assets/orderhistory.png";
import sales from "../assets/growing.png";
import tableImage from "../../public/table.png";
/* This page is the first page the staff sees when they log in */

function DashboardPage({ user }) {
  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      <DashboardNavigation />

      <h1 className="text-3xl font-semibold text-gray-800 text-center mt-6 mb-4">
        {user?.username || "Staff"}'s Dashboard
      </h1>

      <div className="dashboard-grid" style={styles.grid}>
        <NavigationCard
          image={menuImage}
          title="Menu Management"
          navigateTo="/menu-management"
        />
        <NavigationCard
          image={orderImage}
          title="Order Management"
          navigateTo="/add-order"
        />
        <NavigationCard
          image={ticket}
          title="Active Orders"
          navigateTo="/active-orders"
        />
        <NavigationCard
          image={orderHistory}
          title="Order History"
          navigateTo="/order-history"

          image={sales}
          title="Sales Analysis"
          navigateTo="/sales-analysis"
        />
        <NavigationCard
          image={tableImage}
          title="Table Management"
          navigateTo="/TableManagement"
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
      style={styles.card}
      className="shadow-lg"
      onClick={() => navigate(navigateTo)}
    >
      <Card.Img
        variant="top"
        src={image}
        style={styles.cardImage}
      />
      <Card.Body>
        <Card.Text style={styles.cardTitle}>{title}</Card.Text>
      </Card.Body>
    </Card>
  );
};

const styles = {
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "2rem",
    width: "100%",
    marginTop: "2rem",
  },
  card: {
    width: "18rem",
    cursor: "pointer",
    textAlign: "center",
    padding: "10px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  cardImage: {
    width: "100%",
    height: "200px",
    objectFit: "contain",
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: "1.1rem",
  },
};

export default RoleProtection(DashboardPage, ["S", "M", "E"]);
