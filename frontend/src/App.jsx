import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/LogIn";
import SignUpPage from "./pages/SignUp";
import DashboardPage from "./pages/Dashboard";
import ProtectedRoute from "./components/security/ProtectedRoute";

//Focus of this component is to render routing configuration
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
