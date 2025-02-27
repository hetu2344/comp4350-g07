import { Link } from "react-router-dom";
import classes from "./Navigation.module.css";

/*
This component is used to render the header for the Log In Page
*/

function LogInPageNavigation() {
  return (
    <header className={classes.header}>
      <div className={classes.logo}>RestroSync</div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default LogInPageNavigation;
