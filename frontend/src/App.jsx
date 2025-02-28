import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import LogInPage from "./pages/Login";
import SignUpPage from "./pages/Signup";
import DashboardPage from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import EditMenuItem from "./pages/edit-menu-item";
import AddMenuItem from "./pages/add-menu-item";
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
        <Route path="/log-in" element={<LogInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/menu-management" element={<MenuManagement />} />
        <Route path="/edit-menu-item/:id" element={<EditMenuItem />} />
        <Route path="/add-menu-item" element={<AddMenuItem />} />
      </Routes>
    </div>
  );
}

export default App;
