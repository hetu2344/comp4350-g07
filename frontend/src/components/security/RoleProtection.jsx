import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AccessBanner.module.css";

/*
The purpose of this component is to provide security against unwanted access of
particular paths on website. 

For example: If a customer enters the website and then adds a path like /dashboard (which is only meant
for staff) to the link to access this page, the customer wont be able to access this page unless they are
logged in.
*/

function RoleProtection(WrappedComponent, requiredRoles = []) {
  return function ProtectedComponent(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accessDenied, setAccessDenied] = useState(false);
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

          //Check if the user's role is one of the required roles
          if (
            requiredRoles.length > 0 &&
            !requiredRoles.includes(data.user.type)
          ) {
            console.log("TEST 2");
            //Redirect user if they don't have the required role
            setAccessDenied(true);
            // alert(
            //   "Access Denied: You do not have permission to access this page."
            // );
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 3000);
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
      return <div></div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    // return (
    //   <>
    //     {bannerMessage && <div className="banner">{bannerMessage}</div>}
    //     <WrappedComponent {...props} user={user} />;
    //   </>
    // );

    if (accessDenied) {
      return (
        <div className="access-denied-container">
          <div className="access-denied-box">
            <h1>🚫 Access Denied</h1>
            <p>You do not have permission to access this page.</p>
            <p>Redirecting to the dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <WrappedComponent {...props} user={user} />
      </>
    );
  };
}

export default RoleProtection;
