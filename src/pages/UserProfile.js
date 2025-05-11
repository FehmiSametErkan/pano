import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './styles/UserProfile.css';
import Logout from '../components/common/Logout'; // Logout bileşenini içe aktarıyoruz

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserEvents(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserEvents = async (userId) => {
    setLoading(true);
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('creator.uid', '==', userId));
      
      const querySnapshot = await getDocs(q);
      const events = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({ 
          id: doc.id,
          ...eventData,
          // String tarihi Date objesine çeviriyoruz
          date: eventData.date ? new Date(eventData.date) : null
        });
      });

      setUserEvents(events);
      console.log(events)
    } catch (error) {
      console.error("Error fetching events: ", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setUserEvents(userEvents.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event: ', error);
    }
  };


  if (!user) return <div>Lütfen giriş yapın...</div>;

  return (
    <div className="user-profile-container">
      {/* Profile Section */}
      <div className="profile-section">
      {user ? (
        <div className="profile-info">
          <h1>Hoşgeldiniz, {user.displayName || user.email}!</h1>
          <img src={user.photoURL} alt="Profil Fotoğrafı" width="100" />
          <p>Email: {user.email}</p>
          <Logout /> {/* Çıkış butonunu ekledik */}
        </div>
      ) : (
        <div>
          <p>Giriş Yapmadınız</p>
        </div>
      )}
      </div>

      {/* Events Section */}
      <div className="user-events-section">
        <h2 className="user-events-title">Etkinlikleriniz</h2>
        
        {loading ? (
          <p className="loading-text">Yükleniyor...</p>
        ) : userEvents.length > 0 ? (
          <ul className="user-event-list">
            {userEvents.map(event => (
              <li key={event.id} className="user-event-item">
                <div className="user-event-content">
                  <h3>{event.title}</h3>
                  <p className="user-event-description">{event.description}</p>
                  <span className="user-event-date">
                      {event.date?.toLocaleDateString('tr-TR') || 'Tarih belirtilmemiş'}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="user-event-delete-button"
                >
                  Etkinliği Kaldır
                </button>
                {userEvents && (
                  <Link to={`/etkinlik/${event.id}/edit`} className="edit-button">
                    Etkinliği Düzenle
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-events">Henüz etkinlik oluşturmadınız.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;