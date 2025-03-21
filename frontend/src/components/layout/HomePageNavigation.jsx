import { Link } from "react-router-dom";
import classes from "./Navigation.module.css";

/*
This component is used to render the header for the Home Page
*/

function HomePageNavigation() {
  return (
    <header className={classes.header}>
      <div className={classes.logo}>RestroSync</div>
      <nav>
        <ul>
          <li>
            <Link to="/log-in">Log In</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default HomePageNavigation;
