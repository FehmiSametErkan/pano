import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/common/Login";
import Logout from "./components/common/Logout";
import EventDetails from "./pages/EventDetails"; // Detay sayfası için yeni bir bileşen ekleyeceğiz
import NotFound from "./pages/NotFound"; // 404 sayfası ekleyeceğiz
import AuthProvider from "./components/AuthProvider"; // AuthProvider'ı ekliyoruz
import Navbar from "./components/common/Navbar"; // Navbar bileşeni
import CreateEvent from "./pages/CreateEvent";
import EventList from "./components/events/EventList";
import UserProfile from "./pages/UserProfile"; 


const App = () => {
  return (
    <AuthProvider>
      <Router>
      <Navbar /> {/* Navbar tüm sayfalarda görünecek */}
        <Routes>
          {/* Ana Sayfa */}
          <Route path="/" element={<Home/>} />

          {/* Etkinlik Detay Sayfası */}
          <Route path="/etkinlik/:etkinlikId" element={<EventDetails />} />
          <Route path="/etkinlikler/" element={<EventList />} />
          <Route path="/etkinlik-olustur" element={<CreateEvent isEditMode={false} />} />
          <Route path="/etkinlik/:etkinlikId/edit" element={<CreateEvent isEditMode={true} />} />
          <Route path="/profil" element={<UserProfile />} />

          {/* 404 Sayfası */}
          <Route path="*" element={<NotFound />} />

          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
