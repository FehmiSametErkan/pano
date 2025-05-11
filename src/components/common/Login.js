import React, { useState, useContext } from 'react';
import { signInWithGoogle } from '../../firebase';  // Firebase'den Google giriş fonksiyonunu import ettik
import { useNavigate } from 'react-router-dom';  // Kullanıcı giriş yaptıktan sonra yönlendirme için
import { AuthContext } from '../AuthProvider';  // AuthContext'i import ettik

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);  // Kullanıcı bilgisini alıyoruz

  // Eğer kullanıcı giriş yapmışsa, anasayfaya yönlendir
  if (user) {
    navigate('/');  // Home sayfasına yönlendir
    return null;  // Bu durumda component render edilmez
  }

  const handleGoogleLogin = async () => {
    const user = await signInWithGoogle();
      // Kullanıcı bilgilerini sessionStorage'a kaydet
      // Kullanıcıyı App.js içinde kullanabilmek için setUser fonksiyonuyla aktar
      if (user) {
      // Kullanıcı başarılı bir şekilde giriş yaptıysa, anasayfaya yönlendir
      navigate('/');
    } else {
      // Hata durumu için bir mesaj göster
      setError('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="login-container">
      <button onClick={handleGoogleLogin} className="google-login-button">
        Google ile Giriş Yap
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;
