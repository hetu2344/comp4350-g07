import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/LogIn";
import SignUpPage from "./pages/SignUp";
import DashboardPage from "./pages/Dashboard";
import ProtectedRoute from "./components/security/ProtectedRoute";

/*
This function is used for adding routes to the website. Whenever you add a new page
just add the path here along with the page component that will be renedered 
inside element={}

For pages that are used after staff has loged in, place page components inside <ProtectedRoute>
component for security. More info on why this component is used for security is provided in 
its corresponding component page (Componenets->security->ProtectedRoutes.jsx).
*/

function App() {
  return (
    //Add all the paths to the website here
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/log-in" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
