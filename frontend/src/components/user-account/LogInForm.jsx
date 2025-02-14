import Card from "../general-ui/Card";
import classes from "./SignUpForm.module.css";
import { useRef } from "react";

/*
This component renders the LogInForm and also collects the information and forwards it
a function on the Log In Page under pages
*/

function LogInForm(props) {
  const userIdInputRef = useRef();
  const passwordInputRef = useRef();

  /*
Handles log in input
*/
  function submitHandler(event) {
    event.preventDefault();

    const enteredUserId = userIdInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    const userLoginData = {
      username: enteredUserId,
      password: enteredPassword,
    };

    props.onLogIn(userLoginData); /*Forwards data to onLogIn function*/
  }

  return (
    //Below I enclosed the whole form within the Card Component
    //to apply the properties of the card to the form
    <Card>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.title}>Staff Login</div>
        <div className={classes.control}>
          <label htmlFor="userId">Username</label>
          <input type="text" required id="userId" ref={userIdInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Password</label>
          <input type="text" required id="password" ref={passwordInputRef} />
        </div>
        <div className={classes.actions}>
          <button>LOG IN</button>
        </div>
      </form>
    </Card>
  );
}

export default LogInForm;
