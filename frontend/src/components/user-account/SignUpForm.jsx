import Card from "../general-ui/Card";
import classes from "./LogInForm.module.css";
import { useRef } from "react";

function SignUpForm() {
  const userIdInputRef = useRef();
  const passwordInputRef = useRef();
  const fnameInputRef = useRef();
  const lnameInputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();

    const enteredFirstName = fnameInputRef.current.value;
    const enteredLastName = lnameInputRef.current.value;
    const enteredUserId = userIdInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    const userSignUpData = {
      fname: enteredFirstName,
      lname: enteredLastName,
      username: enteredUserId,
      password: enteredPassword,
    };

    console.log(userSignUpData);
  }

  return (
    //<h1 className={classes.title}>Staff Login</h1>
    <Card>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.title}>Staff Sign Up</div>
        <div className={classes.control}>
          <label htmlFor="fname">First Name</label>
          <input type="text" required id="fname" ref={fnameInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="lname">Last Name</label>
          <input type="text" required id="lname" ref={lnameInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="userID">Username</label>
          <input type="text" required id="userID" ref={userIdInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Password</label>
          <input type="text" required id="password" ref={passwordInputRef} />
        </div>
        <div className={classes.actions}>
          <button>SIGN UP</button>
        </div>
      </form>
    </Card>
  );
}

export default SignUpForm;
