import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RoleProtection(WrappedComponent, requiredRoles = []) {
  return function ProtectedComponent(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      async function fetchUser() {
        try {
          const response = await fetch("http://localhost:8018/api/user/me", {
            credentials: "include",
          });

          if (!response.ok) {
            console.log("TEST 1");
            const errorData = await response.json();

            if (response.status === 401) {
              throw new Error(
                errorData.error || "Unauthorized. Please log in."
              );
            }
            if (response.status === 403) {
              throw new Error("Forbidden. You do not have access.");
            }
            throw new Error(
              errorData.error || "An error occurred. Please try again later."
            );
          }

          const data = await response.json();
          setUser(data.user);

          // Check if the user's role is one of the required roles
          if (
            requiredRoles.length > 0 &&
            !requiredRoles.includes(data.user.type)
          ) {
            console.log("TEST 2");
            // Redirect user if they don't have the required role
            alert(
              "Access Denied: You do not have permission to access this page."
            );
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 0);
          }
        } catch (err) {
          setError(err.message);
          navigate("/log-in");
        } finally {
          setLoading(false);
        }
      }

      fetchUser();
    }, [requiredRoles, navigate]);

    if (loading) {
      console.log("TEST 3");
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

export default RoleProtection;
