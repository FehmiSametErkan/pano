import React from "react";
import EventList from "../components/events/EventList";
import Banner from "../components/home/Banner"; 

const Home = () => {

  return (
    <div className="container">
      
      <Banner />
      <EventList />
    </div>
  );
};

export default Home;
