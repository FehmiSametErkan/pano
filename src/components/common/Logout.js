import React, { useContext } from "react";
import { logOut } from "../../firebase"; 
import { useNavigate } from "react-router-dom"; 
import { AuthContext } from "../AuthProvider"; 

const Logout = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleGoogleLogout = async () => {
    await logOut();
    navigate("/");
  };

  return (
    user && (
      <button onClick={handleGoogleLogout} className="google-logout-button">
        Çıkış yap
      </button>
    )
  );
};

export default Logout;
