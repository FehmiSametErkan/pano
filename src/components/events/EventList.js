import { useState, useEffect,useContext } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot} from "firebase/firestore";
import { AuthContext } from "../AuthProvider";
import EventCard from "./EventCard";
import "../styles/events/EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  return (
    <div>
      <div className="event-list">
        {loading && events.length === 0
          ? 
            new Array(6).fill(0).map((_, i) => (
              <div key={i} className="event-card skeleton">
                <div className="image-wrapper">
                  <div className="image-skeleton" />
                </div>
                <div style={{ padding: "0 8px 16px 8px" }}>
                  <div style={{ height: 20, width: "70%", background: "#eee", marginBottom: 8, borderRadius: 4 }} />
                  <div style={{ height: 14, width: "40%", background: "#eee", borderRadius: 4 }} />
                </div>
              </div>
            ))
          : events.map((event) => (
              <div key={event.id}>
                <EventCard user={user} event={event} />
              </div>
            ))}
      </div>
    </div>
  );
};
export default EventList;
