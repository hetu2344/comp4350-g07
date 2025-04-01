import { Link } from "react-router-dom";
import classes from "./Navigation.module.css";

/*
This component is used to render the header for the Table Management page
*/

function TableManagementNavigation() {
  return (
    <header className={classes.header}>
      <div className={classes.logo}>RestroSync</div>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Back To Dashboard123</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default TableManagementNavigation;
