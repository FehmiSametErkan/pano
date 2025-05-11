import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Parametreleri almak için useParams kullanıyoruz
import { doc, getDoc } from 'firebase/firestore';
import { eventsCollectionRef } from '../firebase';
import "./styles/EventDetails.css"; 


const EventDetails = () => {
  const { etkinlikId } = useParams(); 
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const docRef = doc(eventsCollectionRef, etkinlikId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEvent(docSnap.data());
      } else {
        console.log("Etkinlik bulunamadı!");
      }
    };

    fetchEvent();
  }, [etkinlikId]);

  if (!event) return <div>Yükleniyor...</div>;

  return (
    <div className="event-details">
      <img src={event.imageUrl} alt={event.title} />
      <h1>{event.title}</h1>
      <p className='event-description'>{event.description}</p>
      <p><strong>Tarih:</strong> {event.date}</p>
      <p><strong>Konum:</strong> {event.location}</p>
      <ul className="participants-list">  

      {event.participants && event.participants.length > 0 && (
        <>
          {event.participants.slice(0, 1).map((participant, index) => (
            <li key={index}>
        <img src={participant.photoURL} alt={participant.name} />
        <span>{participant.name}</span>
            </li>
          ))}
          {event.participants.length > 1 && (
            <li>
                <span>+{event.participants.length - 1} kişi daha katıldı</span>
            </li>
          )}
        </>
      )}
      </ul>
    </div>
  );
};

export default EventDetails;
