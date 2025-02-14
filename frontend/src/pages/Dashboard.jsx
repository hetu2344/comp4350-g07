import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavigation from "../components/layout/DashboardNavigation";

function DashboardPage() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <div>
      <DashboardNavigation />
      <h1>
        Welcome, {userData.fName} {userData.lName}!
      </h1>
      <h2>
        This is where the rest of the features of the website will be at or
        start at
      </h2>
    </div>
  );
}

export default DashboardPage;
