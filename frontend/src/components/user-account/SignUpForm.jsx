import Card from "../general-ui/Card";
import classes from "./LogInForm.module.css";
import { useRef } from "react";

/*
This component renders the Sign Up Form and collects the entered information and forwards it
a function on the SignUp Page under pages
*/

function SignUpForm(props) {
  const userIdInputRef = useRef();
  const passwordInputRef = useRef();
  const fnameInputRef = useRef();
  const lnameInputRef = useRef();

  /*
Handles Sign up input
*/
  function submitHandler(event) {
    event.preventDefault();

    const enteredFirstName = fnameInputRef.current.value;
    const enteredLastName = lnameInputRef.current.value;
    const enteredUserId = userIdInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    const userSignUpData = {
      fName: enteredFirstName,
      lName: enteredLastName,
      username: enteredUserId,
      password: enteredPassword,
    };

    props.onSignUp(userSignUpData);
  }

  return (
    //Below I enclosed the whole form within the Card Component
    //to apply the properties of the card to the form
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
