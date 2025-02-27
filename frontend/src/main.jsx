import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css"; //Import this for the cream background of the website and some styling for h1 and h2
import App from "./App.jsx";

/*
This is where all your components and pages will finally end and be rendered
*/
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
