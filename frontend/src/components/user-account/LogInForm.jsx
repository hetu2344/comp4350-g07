import Card from "../general-ui/Card";
import classes from "./SignUpForm.module.css";
import { useRef } from "react";

function LogInForm(props) {
  const userIdInputRef = useRef();
  const passwordInputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();

    const enteredUserId = userIdInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    const userLoginData = {
      username: enteredUserId,
      password: enteredPassword,
    };

    console.log(userLoginData);
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
