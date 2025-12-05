import React from 'react';
import '../styles/home/Features.css';
import { FaCalendarAlt, FaUsers, FaBell } from 'react-icons/fa';

const Features = () => {
  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">Neden mi Pano?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaCalendarAlt />
            </div>
            <h3>Binlerce Etkinlik</h3>
            <p>Müzik, spor, sanat, teknoloji ve daha fazlası için yüzlerce etkinlik arasından seçim yapın.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaUsers />
            </div>
            <h3>Pano</h3>
            <p>akademik takvim, ders programı ve etkinlik platformunu tek bir yerden takip edebilmek.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaBell />
            </div>
            <h3>Kişiselleştirilmiş Bildirimler</h3>
            <p>İlgi alanlarınıza göre önerilen etkinliklerden anında haberdar olun.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;