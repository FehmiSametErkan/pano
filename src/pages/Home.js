import React, { useState, useEffect, useContext } from "react";
import EventList from "../components/events/EventList";
import Banner from "../components/home/Banner"; 
import CTA from "../components/home/CTA"; 
import Features from "../components/home/Features";
import Footer from "../components/common/Footer";

const Home = () => {

  return (
    <div className="container">
      
      <Banner />
      <EventList />
      <Features/>
      <CTA/>
      <Footer/>
 
    </div>
  );
};

export default Home;
