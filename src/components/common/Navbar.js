import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider";
import { signInWithGoogle, logOut } from "../../firebase";
import "../styles/common/Navbar.css"

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (user) {
      await logOut();
      navigate("/"); // Çıkış yaptıktan sonra Login sayfasına yönlendir
    } else {
      await signInWithGoogle();
      navigate("/"); // Giriş yapınca Ana Sayfa'ya yönlendir
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        📌 Toplulug
      </Link>

      {/* Sağdaki butonlar */}
      <div className="navbar-links">
        <Link to="/etkinlikler" >
          Etkinlikler
        </Link>
        <Link to="/sehirler" >
          Şehirler
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
          {user ? "Çıkış Yap" : "Google ile Giriş Yap"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
