import { Routes, Route, Navigate } from "react-router-dom";
import SeniorPage from "./pages/SeniorPage";
import FamilyPage from "./pages/FamilyPage";
import SmsCheckPage from "./pages/SmsCheckPage";
import ImageCheckPage from "./pages/ImageCheckPage";
import LivePage from "./pages/LivePage";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/senior" replace />} />
        <Route path="/senior" element={<SeniorPage />} />
        <Route path="/senior/sms" element={<SmsCheckPage />} />
        <Route path="/senior/image" element={<ImageCheckPage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/family" element={<FamilyPage />} />
      </Route>
    </Routes>
  );
}
