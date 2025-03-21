import { Link } from "react-router-dom";
import classes from "./Navigation.module.css";

function SalesAnalysisNavigation() {
  return (
    <header className={classes.header}>
      <div className={classes.logo}>RestroSync</div>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Back To Dashboard</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default SalesAnalysisNavigation;
