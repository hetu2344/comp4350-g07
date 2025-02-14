import { Link, useNavigate } from "react-router-dom";
import classes from "./Navigation.module.css";

//<div className={classes.dashboard}>Dashboard-</div>//

function DashboardNavigation() {
  const navigate = useNavigate();

  function handleLogout() {
    // Clear localStorage
    localStorage.removeItem("userData");

    // Navigate to login page
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
