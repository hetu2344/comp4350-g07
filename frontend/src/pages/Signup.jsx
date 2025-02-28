import { useNavigate } from "react-router-dom";
import SignUpPageNavigation from "../components/layout/SignUpPageNavigation";
import SignUpForm from "../components/user-account/SignUpForm";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RoleProtection from "../components/security/RoleProtection";

/*
Renders the SignUp Page with header and signupform components
*/
function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function addUserHandler(userSignUpData) {
    try {
      const response = await fetch("http://localhost:8018/api/user/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json", // Ensure the server knows you're sending JSON data
        },
        body: JSON.stringify({
          username: userSignUpData.username,
          firstName: userSignUpData.fName,
          lastName: userSignUpData.lName,
          password: userSignUpData.password,
          type: userSignUpData.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || "An error occurred. Please try again later.";
        if (response.status === 400) {
          throw new Error(errorMessage);
        }
        if (response.status === 409) {
          throw new Error(errorMessage);
        }
        if (response.status === 500) {
          throw new Error("Internal Server Error. Please try again later.");
        }
        throw new Error(errorMessage);
      }

      // console.log("User added successfully!");
      // navigate("/dashboard", { replace: true });
      toast.success("Sign-up successful! Redirecting..."); // Show success toast
      setError(""); // Clear any previous error

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 3000);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <SignUpPageNavigation />
      <SignUpForm onSignUp={addUserHandler} errorMessage={error} />
      <ToastContainer position="top-center" />
    </div>
  );
}

export default RoleProtection(SignUpPage, ["S", "M"]);
