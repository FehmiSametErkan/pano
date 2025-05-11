import { useState, useEffect,useContext } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot} from "firebase/firestore";
import { AuthContext } from "../AuthProvider";
import EventCard from "./EventCard";
import "../styles/events/EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const { user } = useContext(AuthContext);


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);


  return (
    <div>
      <div className="event-list">
        {events.map((event) => (
          <div key={event.id}>
            <EventCard
              user={user}
              event={event}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default EventList;
