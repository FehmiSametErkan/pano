import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/common/Login";
import Logout from "./components/common/Logout";
import EventDetails from "./pages/EventDetails"; 
import NotFound from "./pages/NotFound"; 
import AuthProvider, { AuthContext } from "./components/AuthProvider";
import Navbar from "./components/common/Navbar"; 
import CreateEvent from "./pages/CreateEvent";
import EventList from "./components/events/EventList";
import UserProfile from "./pages/UserProfile";
import EmailVerification from "./components/common/EmailVerification";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./components/styles/common/EmailVerification.css";


const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      {user && !user.emailVerified && <EmailVerification />}
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/etkinlik/:etkinlikId"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/etkinlikler/" element={<EventList />} />
        <Route
          path="/etkinlik-olustur"
          element={
            <ProtectedRoute>
              <CreateEvent isEditMode={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/etkinlik/:etkinlikId/edit"
          element={
            <ProtectedRoute>
              <CreateEvent isEditMode={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
};

export default App;
