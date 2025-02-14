import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

/*
The purpose of this component is to provide security against unwanted access of
particular paths on website. 

For example: If a customer enters the website and then adds a path like /dashboard (which is only meant
for staff) to the link to access this page, the customer wont be able to access this page unless they are
logged in.
*/

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData")) //Access user data stored in local storage
  );

  useEffect(() => {
    if (!userData) {
      navigate("/", { replace: true }); //If data not present, redirect back to homepage
    }
  }, [userData, navigate]);

  if (!userData) return null; //Prevent rendering while redirecting

  return children; //Render the child components (i.e., the protected page content)
}

export default ProtectedRoute;
