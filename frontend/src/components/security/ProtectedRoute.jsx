import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData"))
  );

  useEffect(() => {
    if (!userData) {
      navigate("/", { replace: true }); // Redirect to login if not authenticated
    }
  }, [userData, navigate]);

  if (!userData) return null; // Prevent rendering while redirecting

  return children; // Render the child components (i.e., the protected page content)
}

export default ProtectedRoute;
