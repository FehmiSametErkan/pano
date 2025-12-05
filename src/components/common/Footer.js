import React from "react";
import "../styles/common/Footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3 className="footer-title">Toplulug</h3>
            <p className="footer-about">
              Toplulug ile sevdiğiniz aktiviteleri paylaşan insanlarla buluşun,
              yeni etkinlikler keşfedin ve unutulmaz anılar biriktirin.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          
          <div className="footer-column">
            <h3 className="footer-title">Hızlı Linkler</h3>
            <ul className="footer-links">
              <li>
                <a href="/">Ana Sayfa</a>
              </li>
              <li>
                <a href="/etkinlikler">Etkinlikler</a>
              </li>
              <li>
                <a href="/etkinlik-olustur">Etkinlik Oluştur</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
            </ul>
          </div>

          
          <div className="footer-column">
            <h3 className="footer-title">Yardım</h3>
            <ul className="footer-links">
              <li>
                <a href="/help">Yardım Merkezi</a>
              </li>
              <li>
                <a href="/privacy">Gizlilik Politikası</a>
              </li>
              <li>
                <a href="/terms">Kullanım Şartları</a>
              </li>
              <li>
                <a href="/cookies">Çerez Politikası</a>
              </li>
              <li>
                <a href="/contact">İletişim</a>
              </li>
            </ul>
          </div>

          
          <div className="footer-column">
            <h3 className="footer-title">İletişim</h3>
            <ul className="footer-contact">
              <li>
                <FaMapMarkerAlt />
                <span>İstanbul, Türkiye</span>
              </li>
              <li>
                <FaPhone />
                <span>+90 555 123 45 67</span>
              </li>
              <li>
                <FaEnvelope />
                <span>info@toplulug.com</span>
              </li>
            </ul>

            <div className="app-download">
              <h4>Mobil Uygulamamız</h4>
              <div className="app-buttons">
                <a href="#" className="app-btn">
                  <FaGooglePlay /> Google Play
                </a>
                <a href="#" className="app-btn">
                  <FaApple /> App Store
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} Toplulug. Tüm hakları saklıdır.
          </div>
          <div className="footer-lang">
            <select className="lang-selector">
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
