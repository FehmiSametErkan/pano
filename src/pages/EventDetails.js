import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { eventsCollectionRef } from '../firebase';
import DOMPurify from 'dompurify';
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
      }
    };

    fetchEvent();
  }, [etkinlikId]);

  const [imageLoaded, setImageLoaded] = useState(false);

  if (!event) return <div>Yükleniyor...</div>;

  return (
    <div className="event-details">
      <div className="details-image-wrapper">
        {!imageLoaded && <div className="details-image-skeleton" />}
        <img
          src={event.imageUrl}
          alt={event.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      <h1>{event.title}</h1>
      <p className='event-description' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }} />
      <p><strong>Tarih:</strong> {event.date}</p>
      <p><strong>Konum:</strong> {event.location}</p>
      {event.fileUrl && (
        <a href={event.fileUrl} target="_blank" rel="noopener noreferrer" download className="download-button">
          Dosyayı İndir
        </a>
      )}
      <ul className="participants-list">  

      {event.participants && event.participants.length > 0 && (
        <>
          {event.participants.slice(0, 1).map((participant, index) => (
            <li key={index}>
              <img src={participant.photoURL} alt={participant.name} loading="lazy" />
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
