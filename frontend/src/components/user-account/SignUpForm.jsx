import Card from "../general-ui/Card";
import classes from "./LogInForm.module.css";
import { useRef, useState } from "react";

/*
This component renders the Sign Up Form and collects the entered information and forwards it
a function on the SignUp Page under pages
*/

function SignUpForm(props) {
  const userIdInputRef = useRef();
  const passwordInputRef = useRef();
  const fnameInputRef = useRef();
  const lnameInputRef = useRef();
  const [selectedRole, setSelectedRole] = useState("S"); //Default role selection

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
      type: selectedRole,
    };

    console.log(userSignUpData);
    props.onSignUp(userSignUpData);
  }

  return (
    //Below I enclosed the whole form within the Card Component
    //to apply the properties of the card to the form
    <Card>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.title}>Create Staff Account</div>
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
          <input type="password" required id="password" ref={passwordInputRef} autocomplete="off"/>
        </div>
        <div className={classes.control}>
          <label htmlFor="role">Select Role</label>
          <select
            id="role"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
          >
            <option value="S">Store Owner</option>
            <option value="M">Manager</option>
            <option value="E">Employee</option>
          </select>
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
          <button>SIGN UP</button>
        </div>
      </form>
    </Card>
  );
}

export default SignUpForm;
