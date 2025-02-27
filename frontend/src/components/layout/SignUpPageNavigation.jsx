import { Link } from "react-router-dom";
import classes from "./Navigation.module.css";

/*
This component is used to render the header for the Sign up Page
*/

function SignUpPageNavigation() {
  return (
    <header className={classes.header}>
      <div className={classes.logo}>RestroSync</div>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">To Dashboard</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default SignUpPageNavigation;
