import { Link } from "react-router-dom";
import classes from "./Navigation.module.css";

//<div className={classes.dashboard}>-UserName's Dashboard-</div>//

function HomePageNavigation() {
  return (
    <header className={classes.header}>
      <div className={classes.logo}>RestroSync</div>
      <nav>
        <ul>
          <li>
            <Link to="/log-in">Log In</Link>
          </li>
          <li>
            <Link to="/sign-up">Sign Up</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default HomePageNavigation;
