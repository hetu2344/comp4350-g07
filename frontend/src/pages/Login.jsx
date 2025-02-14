import LogInPageNavigation from "../components/layout/LogInPageNavigation";
import LogInForm from "../components/user-account/LogInForm";
import { useNavigate } from "react-router-dom";

/*
This page is used to render the full Log In Page including header and form
<For now> It also takes user log in data, autheticates it and logs in the user
*/

function LoginPage() {
  const navigate = useNavigate();

  /*
  The function below is used to first request all user data, compare current user log in
  data with all user data to see for a match, and if matched, add user data to local storage
  and move to the Dashboards page
  */
  async function authenticateUserHandler(userLogInData) {
    try {
      const response = await fetch("http://localhost:8018/api/users");
      const users = await response.json();

      //Find a matching user
      const matchedUser = users.find(
        (user) =>
          user.username === userLogInData.username &&
          user.pass === userLogInData.password
      );

      if (matchedUser) {
        //Store user data in localStorage
        localStorage.setItem(
          "userData",
          JSON.stringify({
            fName: matchedUser.f_name,
            lName: matchedUser.l_name,
            username: matchedUser.username,
            userId: matchedUser.user_id,
          })
        );

        //Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        alert("Invalid username or password.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  return (
    <div>
      <LogInPageNavigation />
      <LogInForm onLogIn={authenticateUserHandler} />
    </div>
  );
}

export default LoginPage;
