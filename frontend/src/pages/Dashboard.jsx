import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavigation from "../components/layout/DashboardNavigation";

function DashboardPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData"))
  );

  // Redirect to login if no user data is found
  useEffect(() => {
    if (!userData) {
      navigate("/", { replace: true });
    }
  }, [userData, navigate]);

  if (!userData) return null; // Prevents rendering if being redirected

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
