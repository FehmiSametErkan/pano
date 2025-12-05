import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider";
import { logOut } from "../../firebase";
import "../styles/common/Navbar.css"

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (user) {
      await logOut();
      navigate("/"); 
    } else {
      navigate("/login"); 
    }
  };

  return (
    <nav className="navbar">
      
      <Link to="/" className="navbar-logo">
        📌 Pano
      </Link>

      
      <div className="navbar-links">
        <Link to="/etkinlikler" >
          Etkinlikler
        </Link>
        <Link to="/profil" >
          Profil
        </Link>
        {user ?  
        <Link to="etkinlik-olustur" > 
          Etkinlik Oluştur
        </Link>
        : null}
        <button className="navbar-button" onClick={handleAuth} >
          {user ? "Çıkış Yap" : "Giriş Yap"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
