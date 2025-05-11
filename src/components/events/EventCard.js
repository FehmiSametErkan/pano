import React from "react";
import { useState, useEffect } from "react";
import "../styles/events/EventCard.css";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { doc, updateDoc, onSnapshot, collection ,arrayUnion } from "firebase/firestore";
import avatar from "../../assets/default-avatar.jpg";


const EventCard = ({ event,user }) => {
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    if (user && event.participants) {
      setIsParticipating(event.participants.some(p => p.uid === user.uid));
    }
  }, [user, event.participants]);


  const handleJoinEvent = async (eventId) => {
    const eventRef = doc(db, "events", eventId);
    
    if (!user?.uid) {
      alert("Lütfen giriş yapın!");
      return;
    } 
    
    if (isParticipating) {
      alert("Zaten bu etkinliğe katıldınız!");
      return;
    }

    const participant = {
      uid: user.uid,
      photoURL: user.photoURL ||avatar,
    };
    console.log(participant)
    try {
      await updateDoc(eventRef, {
        participants: arrayUnion(participant),
      });

      alert("Etkinliğe katıldınız!");
      setIsParticipating(true);
    } catch (error) {
      console.error("Katılma hatası:", error);
    }
  };
  console.log(event)
  return (
    <div className="event-card">
      <img src={event.imageUrl} alt="Event" className="event-image" />
      
      <h6 className="title">
        <Link to={`/etkinlik/${event.id}`} className="button">
          {event.title}
        </Link>
      </h6>
      
      <div className="event-cart-details">
        <p className="event-date" >{event.date}</p>
        <p className="event-location">{event.location}</p>
      </div>

      <div className="participant-list">
          {event.participants.map((e,id) => <img key={id} alt="person" src={e.photoURL || avatar} className="person-img"/> )}
      </div>
      
      {isParticipating ? (
      <button onClick={() => handleJoinEvent(event.id)} className="event-button joined">
        Katıldınız
      </button>
      ) : (
        <button onClick={() => handleJoinEvent(event.id)} className="event-button">
          Katıl
        </button>
      )}
    </div> 
  );
};

export default EventCard;
