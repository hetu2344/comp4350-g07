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
    <Card>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.title}>Staff Login</div>
        <div className={classes.control}>
          <label htmlFor="userId">Username</label>
          <input type="text" required id="userId" ref={userIdInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Password</label>
          <input type="password" required id="password" ref={passwordInputRef} autocomplete="off"/>
        </div>
        {props.errorMessage && (
          <div
            style={{
              backgroundColor: "#ffe6e6",
              color: "#d8000c",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #d8000c",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            {props.errorMessage}
          </div>
        )}
        <div className={classes.actions}>
          <button>LOG IN</button>
        </div>
      </form>
    </Card>
  );
}

export default LogInForm;
