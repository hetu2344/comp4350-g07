import LogInPageNavigation from "../components/layout/LogInPageNavigation";
import LogInForm from "../components/user-account/LogInForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/*
This page is used to render the full Log In Page including header and form (test comment)
<For now> It also takes user log in data, autheticates it and logs in the user
*/

function LogInPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  /*
  The function below is used to first request all user data, compare current user log in
  data with all user data to see for a match, and if matched, add user data to local storage
  and move to the Dashboards page
  */
  async function authenticateUserHandler(userLogInData) {
    try {
      const response = await fetch("http://localhost:8018/api/user/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json", // Ensure the server knows you're sending JSON data
        },
        body: JSON.stringify({
          username: userLogInData.username,
          password: userLogInData.password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error || "An error occurred. Please try again later.";
        if (response.status === 400) {
          throw new Error(errorMessage);
        }
        if (response.status === 401) {
          throw new Error("Invalid credentials. Please try again.");
        }
        if (response.status === 404) {
          throw new Error(errorMessage);
        }
        if (response.status === 500) {
          throw new Error("Internal Server Error. Please try again later.");
        }
        throw new Error(errorMessage);
      }

      //Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    }
  }

  return (
    //The way this page is renedered is by first placing the Navigation header on top and then
    //rendering the rest of the page below
    <div>
      <LogInPageNavigation />
      <LogInForm onLogIn={authenticateUserHandler} errorMessage={error} />
    </div>
  );
}

export default LogInPage;
