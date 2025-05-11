import React, { useState, useContext } from "react";
import { logOut } from "../../firebase"; // Firebase'den Google giriş fonksiyonunu import ettik
import { useNavigate } from "react-router-dom"; // Kullanıcı giriş yaptıktan sonra yönlendirme için
import { AuthContext } from "../AuthProvider"; // AuthContext'i import ettik

const Logout = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleGoogleLogout = async () => {
    const user = await logOut();
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
