import { useNavigate } from "react-router-dom";
import SignUpPageNavigation from "../components/layout/SignUpPageNavigation";
import SignUpForm from "../components/user-account/SignUpForm";

/*
Renders the SignUp Page with header and signupform components
<For now> it also fetches all users, checks if entered username exists, if not
adds the user to the database
*/
function SignUpPage() {
  const navigate = useNavigate();

  async function addUserHandler(userSignUpData) {
    try {
      console.log("Fetching users..."); //Logging before fetch

      const response = await fetch("http://localhost:8018/api/user/signup",{
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json", // Ensure the server knows you're sending JSON data
        },
        body: JSON.stringify({
          username: userSignUpData.username,
          password: userSignUpData.password,
          firstName: userSignUpData.firstName,
          lastName: userSignUpData.firstName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const users = await response.json(); //Convert response to JSON

      console.log("Fetched users:", users); //Logging the fetched users

      const usernameExists = users.some(
        (user) =>
          user.username &&
          userSignUpData.username &&
          user.username.toLowerCase() === userSignUpData.username.toLowerCase()
      );

      if (usernameExists) {
        console.log("Username already taken!");
        alert("This username is already taken. Please choose another one.");
        return; //Stop execution if username exists
      }

      //If username is unique, proceed with POST request and add user to database
      console.log("Username is unique, creating user...");
      const postResponse = await fetch("http://localhost:8018/api/user", {
        method: "POST",
        body: JSON.stringify(userSignUpData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!postResponse.ok) {
        throw new Error(`Failed to add user! Status: ${postResponse.status}`);
      }

      console.log("User added successfully!");
      alert("Account created successfully! Redirecting to login...");
      navigate("/log-in", { replace: true });
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  }

  return (
    <div>
      <SignUpPageNavigation />
      <SignUpForm onSignUp={addUserHandler} />
    </div>
  );
}

export default SignUpPage;
