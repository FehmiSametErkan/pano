import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { FaCheckCircle } from 'react-icons/fa';
import './styles/UserProfile.css';
import defaultAvatar from "../assets/default-avatar.jpg";


const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await currentUser.reload(); 
        
        (async () => {
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) setUserProfile(userDocSnap.data());
          } catch (e) {
            console.warn('Could not fetch user profile', e);
          }
        })();
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
       
          date: eventData.date ? new Date(eventData.date) : null
        });
      });

      setUserEvents(events);
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

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!user) {
    return (
      <div>
        Lütfen profilinizi görüntülemek için <Link to="/login">giriş yapın</Link>.
      </div>
    );
  }


  return (
    <div className="user-profile-container">
      <header className="profile-header">
        <h1>Profilim</h1>
        
        <br/>
        <div className="user-info">
          {console.log(user)}
          <img 
              src={user.photoURL || defaultAvatar} 
            alt="Profil" 
            className="profile-avatar"
          />
        <br/>

          <div className="user-details">
        <br/>

            <h2>{userProfile?.displayName || user?.displayName || 'Anonymous User'}</h2>
            <p className="email">
              {user.email}
              {user.emailVerified && <FaCheckCircle className="verified-icon" />}
            </p>
            {!user.emailVerified && (
              <button 
                onClick={() => sendEmailVerification(user)} 
                className="verify-email-button"
              >
                E-postayı doğrula
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="profile-main">
        <section className="user-events">
          <h3>Oluşturduğum Etkinlikler</h3>
          {userEvents.length > 0 ? (
            <div className="events-grid">
              {userEvents.map(event => (
                <div key={event.id} className="user-created-event-card">
                  <h4>{event.title}</h4>
                  <div className="event-actions">
                  <Link to={`/etkinlik/${event.id}/edit`} className="user-event-details-button">Düzenle</Link>
                  <button onClick={() => handleDeleteEvent(event.id)} className="user-event-delete-button">Sil</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Henüz bir etkinlik oluşturmadınız. <Link to="/create-event">Yeni bir tane oluşturun!</Link></p>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserProfile;