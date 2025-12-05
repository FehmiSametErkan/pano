import React, { useState, useContext, useEffect } from 'react';
import './Login.css';
import { signInWithGoogle, registerWithEmail, signInWithEmail, sendPasswordReset, isEmailVerified, logOut } from '../../firebase';  
import { useNavigate } from 'react-router-dom';  
import { AuthContext } from '../AuthProvider';  

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);  

  useEffect(() => {
    if (user && user.emailVerified) navigate('/');
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser) {
        if (!googleUser.emailVerified) {
          setError('Google hesabınızdaki e-posta doğrulanmamış. Lütfen e-postanızı doğrulayın ve tekrar deneyin.');
          
          await logOut();
          return;
        }
        navigate('/');
      } else {
        setError('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Google ile giriş sırasında bir hata oluştu.');
    }
  };

  const [mode, setMode] = useState('login'); 
  const [name, setName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const sanitize = (s) => (s || '').toString().trim();

  const resetForm = () => {
    setName('');
    setEmailInput('');
    setPassword('');
    setPasswordConfirm('');
    setResetEmail('');
  };

  const FIREBASE_ERROR_MESSAGES = {
    'auth/operation-not-allowed': 'Bu oturum yöntemi proje ayarlarında etkin değil. Firebase Console -> Authentication -> Sign-in method kontrol edin.',
    'auth/email-already-in-use': 'Bu e‑posta zaten kayıtlı. Giriş yapmayı deneyin.',
    'auth/invalid-email': 'Geçersiz e‑posta adresi.',
    'auth/weak-password': 'Şifre çok zayıf (en az 6 karakter).',
    'auth/wrong-password': 'Yanlış şifre.',
    'auth/user-not-found': 'Bu e‑posta ile kayıtlı kullanıcı bulunamadı.'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const _name = sanitize(name);
        const _email = sanitize(emailInput);
        const _password = password;
        const _confirm = passwordConfirm;
        if (!_name) return setError('Lütfen isim girin.');
        if (!_email) return setError('Lütfen e‑posta girin.');
        if (_password.length < 6) return setError('Şifre en az 6 karakter olmalı.');
        
        if (!/[A-Za-z]/.test(_password) || !/[0-9]/.test(_password)) return setError('Şifre en az bir harf ve bir rakam içermeli.');
        if (_password !== _confirm) return setError('Şifreler eşleşmiyor.');

        try {
          await registerWithEmail(_email, _password, _name);
          
          setSuccessMessage('Kayıt başarılı! Giriş yapmadan önce lütfen e-postanızı kontrol edip doğrulama işlemini tamamlayın.');
          resetForm();
          setMode('login');
        } catch (err) {
          const message = FIREBASE_ERROR_MESSAGES[err.code] || err.message || 'Kayıt sırasında hata oluştu.';
          
          if (err.code === 'auth/email-already-in-use') {
            setError(message + ' Giriş yapmak ister misiniz?');
            setMode('login');
          } else {
            setError(message);
          }
        }
      } else {
        try {
          const userCredential = await signInWithEmail(sanitize(emailInput), password);
          
          
          const emailVerified = await isEmailVerified(userCredential);
          if (!emailVerified) {
            setError('E-postanız henüz doğrulanmadı. Lütfen e-postanızdaki doğrulama bağlantısını tıklayın.');
            return;
          }
          
          resetForm();
          navigate('/');
        } catch (err) {
          const message = FIREBASE_ERROR_MESSAGES[err.code] || err.message || 'Giriş sırasında hata oluştu.';
          setError(message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      if (!resetEmail) {
        setError('Lütfen e-posta adresinizi girin.');
        setIsSubmitting(false);
        return;
      }
      const result = await sendPasswordReset(sanitize(resetEmail));
      setSuccessMessage(result.message);
      setResetEmail('');
      setShowPasswordReset(false);
    } catch (err) {
      setError(err.message || 'Şifre sıfırlama sırasında hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="İsim" required />
          )}

          <input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Email" type="email" autoComplete="email" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" type="password" autoComplete="new-password" minLength={6} required />
          {mode === 'register' && (
            <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Şifre (tekrar)" type="password" autoComplete="new-password" minLength={6} required />
          )}

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? (mode === 'login' ? 'Giriş yapılıyor...' : 'Kayıt yapılıyor...') : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
          
          {mode === 'login' && (
            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={() => { setShowPasswordReset(!showPasswordReset); setError(null); }}
            >
              Şifreni mi unuttun?
            </button>
          )}
          
          {successMessage && <p className="success-message">{successMessage}</p>}
        </form>

        {showPasswordReset && (
          <form onSubmit={handlePasswordReset} className="auth-form password-reset-form">
            <h3>Şifre Sıfırla</h3>
            <input 
              value={resetEmail} 
              onChange={(e) => setResetEmail(e.target.value)} 
              placeholder="E-posta adresinizi girin" 
              type="email" 
              required 
            />
            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Gönderiliyor...' : 'Şifre Sıfırlama E-postası Gönder'}
            </button>
            <button 
              type="button" 
              className="btn"
              onClick={() => { setShowPasswordReset(false); setError(null); }}
            >
              İptal
            </button>
          </form>
        )}

        <div className="divider">veya</div>

        <button onClick={handleGoogleLogin} className="google-login-button">
          Google ile Giriş Yap
        </button>

        <div className="mode-toggle">
          {mode === 'login' ? (
            <p>Hesabın yok mu? <button onClick={() => { setMode('register'); setError(null); }}>Kayıt Ol</button></p>
          ) : (
            <p>Zaten üye misin? <button onClick={() => { setMode('login'); setError(null); }}>Giriş Yap</button></p>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
