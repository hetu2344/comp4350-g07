import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import LogInPage from "./pages/Login";
import SignUpPage from "./pages/Signup";
import DashboardPage from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import EditMenuItem from "./pages/edit-menu-item";
import AddMenuItem from "./pages/add-menu-item";
import TableManagement from "./pages/TableManagement";
import Reservation from "./pages/Reservation";
import AddOrder from "./pages/add-order";
import ActiveOrders from "./pages/active-orders";
import EditOrder from "./pages/edit-order";
import orderHistory from "./pages/order-history";
import OrderHistory from "./pages/order-history";
import SalesAnalysis from "./pages/SalesAnalysis";

/*
This function is used for adding routes to the website. Whenever you add a new page
just add the path here along with the page component that will be renedered 
inside element={}
*/

function App() {
  return (
    //Add all the paths to the website here
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/log-in" element={<LogInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />\
        <Route path="/menu-management" element={<MenuManagement />} />
        <Route path="/edit-menu-item/:id" element={<EditMenuItem />} />
        <Route path="/add-menu-item" element={<AddMenuItem />} />
        <Route path="/TableManagement" element={<TableManagement />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/add-order" element={<AddOrder />} />
        <Route path="/active-orders" element={<ActiveOrders />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/edit-order/:order_number" element={<EditOrder />} />
        <Route path="/sales-analysis" element={<SalesAnalysis />} />
      </Routes>
    </div>
  );
}

export default App;
