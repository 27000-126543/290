import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Monitor from "./pages/Monitor";
import WorkOrders from "./pages/WorkOrders";
import Revenue from "./pages/Revenue";
import GridConnection from "./pages/GridConnection";
import EnergyStorage from "./pages/EnergyStorage";
import Trading from "./pages/Trading";
import Membership from "./pages/Membership";
import Admin from "./pages/Admin";
import Home from "./pages/Home";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/workorders" element={<WorkOrders />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/grid-connection" element={<GridConnection />} />
        <Route path="/energy-storage" element={<EnergyStorage />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
