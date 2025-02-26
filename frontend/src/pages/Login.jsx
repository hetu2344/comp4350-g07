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
      const response = await fetch("http://localhost:8018/api/user/login", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json", // Ensure the server knows you're sending JSON data
        },
        body: JSON.stringify({
          username: userLogInData.username,
          password: userLogInData.password
        })
      });
      const users = await response.json();



      //Navigate to dashboard
      navigate("/dashboard", { replace: true });
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
