import React from "react";
import "../styles/home/Banner.css"
import { Link } from "react-router-dom";


const Banner = () => {
  return (
    <div className="banner">
      <h1>İlgi alanlarınıza göre etkinlikler keşfedin</h1>
      <p>
        Topluluğunu yönetmek, fiziksel veya çevrim içi etkinlikler düzenlemek
        için ihtiyacın olan her şey burada.
      </p>
      
      <Link to="/etkinlikler" className="banner-button">
          <button className="banner-button" >Etkinlikleri keşfetin</button> 
      </Link>
    </div>
  );
};

export default Banner;
