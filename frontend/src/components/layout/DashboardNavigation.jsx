import { Link, useNavigate } from "react-router-dom";
import classes from "./Navigation.module.css";

//<div className={classes.dashboard}>Dashboard-</div>//

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
  function handleLogout() {
    // Clear localStorage
    localStorage.removeItem("userData");

    // Navigate to home page
    navigate("/", { replace: true });
  }
  return (
    <header className={classes.header}>
      <div className={classes.logo}>RestroSync</div>
      <nav>
        <ul>
          <li>
            <button onClick={handleLogout} className={classes.logoutButton}>
              Log Out
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default DashboardNavigation;
