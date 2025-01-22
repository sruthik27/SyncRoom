import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Removed from "./components/Removed";
import Expired from "./components/Expired";
import App from "./App";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/removed" element={<Removed />} />
        <Route path="/expired" element={<Expired />} />
      </Routes>
    </Router>
  </StrictMode>,
);
