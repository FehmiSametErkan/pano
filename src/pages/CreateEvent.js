import { useContext, useState, useRef, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import "./styles/CreateEvent.css";
import avatar from "../assets/default-avatar.jpg";
import { AuthContext } from "../components/AuthProvider";
import { useParams, useNavigate } from "react-router-dom";

const CreateEvent = ({ isEditMode = false }) => {
  const { user } = useContext(AuthContext);
  const { etkinlikId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode && etkinlikId) {
      const fetchEventData = async () => {
        try {
          const eventDoc = await getDoc(doc(db, "events", etkinlikId));
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            setTitle(eventData.title);
            setDescription(eventData.description);
            setDate(eventData.date);
            setLocation(eventData.location);
            if (eventData.imageUrl) {
              setExistingImageUrl(eventData.imageUrl);
              setPreview(eventData.imageUrl);
            }
          } else {
            console.log("Etkinlik bulunamadı!");
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching event data:", error);
        }
      };
      fetchEventData();
    }
  }, [isEditMode, etkinlikId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setExistingImageUrl("");
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const storageRef = ref(
      storage,
      `event-images/${user.uid}/${Date.now()}_${file.name}`
    );
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  console.log(user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !date || !location) {
      return alert("Tüm alanları doldurun!");
    }

    setIsSubmitting(true);

    try {
      const userPhotoURL = user.photoURL || avatar;

      let imageUrl = existingImageUrl;
      if (image) {
        imageUrl = await uploadImage(image);
      } else if (!preview && existingImageUrl) {
        const oldImageRef = ref(storage, existingImageUrl);
        await deleteObject(oldImageRef).catch((error) => {
          console.log("Fotoğrafı silerken bir hata oluştu", error);
        });
        imageUrl = null;
      }

      const eventData = {
        title,
        description,
        date,
        location,
        imageUrl,
        creator: {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: userPhotoURL,
        },
      };
      if (isEditMode) {
        await updateDoc(doc(db, "events", etkinlikId), eventData);
        alert("Etkinlik başarıyla güncellendi!");
        navigate(`/etkinlik/${etkinlikId}`);
      } else {
        await addDoc(collection(db, "events"), {
          ...eventData,
          participants: [],
          createdAt: new Date(),
        });
        alert("Etkinlik başarıyla oluşturuldu!");
      }

      if (!isEditMode) {
        setTitle("");
        setDescription("");
        setDate("");
        setLocation("");
        setImage(null);
        setPreview("");
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview("");
    setExistingImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!user) return <div>Lütfen giriş yapın...</div>;

  return (
    <div className="event-creation-form">
      <h2>{isEditMode ? "Etkinliği Düzenle" : "Etkinlik Oluştur"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="image-upload-section">
          <label htmlFor="event-image" className="image-upload-label">
            {preview ? (
              <div className="image-preview-container">
                <img src={preview} alt="Önizleme" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="image-placeholder">
                <span>+</span>
                <p>Kapak Resmi Ekle</p>
              </div>
            )}
          </label>
          <input
            id="event-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="image-input"
          />
        </div>

        <input
          type="text"
          placeholder="Etkinlik Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Konum (Örnek: Ankara)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <textarea
          placeholder="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Kaydediliyor..."
            : isEditMode
            ? "Değişiklikleri Kaydet"
            : "Etkinliği Kaydet"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
