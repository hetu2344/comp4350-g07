import { Link, useNavigate } from "react-router-dom";
import classes from "./Navigation.module.css";

/*
This component is used to render the header for the DashboardNavigation Page
It also has implementation for the log out button
*/
function DashboardNavigation() {
  const navigate = useNavigate();

  /*
    This function handles logout by clearing local storage and 
    redirecting user to home page
    */
  const logoutHandler = async () => {
    try {
      const response = await fetch("http://localhost:8018/api/user/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to log out. Please try again.");
      }

      const data = await response.json();
      console.log(data.message); // Log the success message

      // Redirect to the login page or another appropriate page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <header className={classes.header}>
      <div className={classes.logo}>RestroSync</div>
      <nav>
        <ul>
          <li>
            <Link to="/sign-up">Create Staff Account</Link>
          </li>
          <li>
            <button onClick={logoutHandler} className={classes.logoutButton}>
              Log Out
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default DashboardNavigation;
