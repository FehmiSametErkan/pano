import React from "react";
import { useState, useEffect } from "react";
import "../styles/events/EventCard.css";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import avatar from "../../assets/default-avatar.jpg";

const EventCard = ({ event, user }) => {
  const [isParticipating, setIsParticipating] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && event.participants) {
      setIsParticipating(event.participants.some(p => p.uid === user.uid));
    }
  }, [user, event.participants]);

  const handleCardClick = () => {
    if (user) {
      setShowDate(!showDate);
    } else {
      alert("etkinlik detayını görmek için lütfen giriş yapın");
      navigate('/login');
    }
  };

  const handleJoinEvent = async (e, eventId) => {
    e.stopPropagation();
    const eventRef = doc(db, "events", eventId);
    
    if (!user?.uid) {
      alert("Lütfen giriş yapın!");
      navigate('/login');
      return;
    } 
    
    if (isParticipating) {
      alert("Zaten bu etkinliğe katıldınız!");
      return;
    }

    const participant = {
      uid: user.uid,
      photoURL: user.photoURL || avatar,
    };
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
  
  const [imageLoaded, setImageLoaded] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < today;

  return (
    <div className="event-card" onClick={handleCardClick}>
      <div className="image-wrapper">
        {!imageLoaded && <div className="image-skeleton" />}
        <img
          src={event.imageUrl}
          alt="Event"
          className={`event-image ${imageLoaded ? "loaded" : ""}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      
      <div className="card-body">
        <h6 className="title">
          <button
            className="link-button"
            onClick={(e) => {
              e.stopPropagation();
              if (user) {
                navigate(`/etkinlik/${event.id}`);
              } else {
                alert("Detay görmek için lütfen giriş yapın");
              }
            }}
          >
            {event.title}
          </button>
        </h6>

        <div className="event-cart-details">
          {showDate ? (
            <p className="event-date">{event.date}</p>
          ) : (
            <p className="event-date-placeholder">Tarihi görmek için tıklayın</p>
          )}
          <p className="event-location">{event.location}</p>
        </div>

        <div className="participant-list">
          {event.participants.map((e, id) => (
            <img
              key={id}
              alt="person"
              src={e.photoURL || avatar}
              className="person-img"
              loading="lazy"
            />
          ))}
        </div>
      </div>
      
      {isPastEvent ? (
        <p className="event-passed">Etkinliğin süresi geçti</p>
      ) : isParticipating ? (
        <button onClick={(e) => handleJoinEvent(e, event.id)} className="event-button joined">
          Katıldınız
        </button>
      ) : (
        <button onClick={(e) => handleJoinEvent(e, event.id)} className="event-button">
          Katıl
        </button>
      )}
    </div> 
  );
};

export default EventCard;
