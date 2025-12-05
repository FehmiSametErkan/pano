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
  const [file, setFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState("");
  const fileInputRef = useRef(null);
  const eventFileInputRef = useRef(null);

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
            if (eventData.fileUrl) {
              setExistingFileUrl(eventData.fileUrl);
            }
          } else {
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExistingFileUrl("");
    }
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const storageRef = ref(
      storage,
      `event-files/${user.uid}/${Date.now()}_${file.name}`
    );
    const metadata = {
      contentType: file.type,
      cacheControl: "public,max-age=31536000,immutable",
    };
    await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(storageRef);
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const storageRef = ref(
      storage,
      `event-images/${user.uid}/${Date.now()}_${file.name}`
    );

    const resizeIfNeeded = async (fileToCheck) => {
      try {
        const MAX_BYTES = 500 * 1024; 
        const MAX_WIDTH = 1600; 
        const MAX_HEIGHT = 1200; 
        const QUALITY = 0.8; 

        if (fileToCheck.size <= MAX_BYTES) return fileToCheck;

        const bitmap = await createImageBitmap(fileToCheck);
        let { width, height } = bitmap;

        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1);
        const targetWidth = Math.round(width * ratio);
        const targetHeight = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, fileToCheck.type, QUALITY)
        );

        if (!blob) return fileToCheck;

        const compressed = new File([blob], fileToCheck.name, { type: fileToCheck.type });
        return compressed;
      } catch (err) {
        console.warn('Image resize failed, uploading original', err);
        return fileToCheck;
      }
    };

    const metadata = {
      contentType: file.type,
      cacheControl: "public,max-age=31536000,immutable",
    };

    const toUpload = await resizeIfNeeded(file);

    await uploadBytes(storageRef, toUpload, metadata);
    return await getDownloadURL(storageRef);
  };

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
        });
        imageUrl = null;
      }

      let fileUrl = existingFileUrl;
      if (file) {
        fileUrl = await uploadFile(file);
      } else if (!file && existingFileUrl) {
      }

      const eventData = {
        title,
        description,
        date,
        location,
        imageUrl,
        fileUrl,
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
        setFile(null);
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

  const handleRemoveFile = () => {
    setFile(null);
    setExistingFileUrl("");
    if (eventFileInputRef.current) {
      eventFileInputRef.current.value = "";
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
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="file-upload-section">
          <label htmlFor="event-file" className="file-upload-label">
            {file || existingFileUrl ? (
              <div className="file-preview-container">
                <p>{file ? file.name : "Dosya mevcut"}</p>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={handleRemoveFile}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="file-placeholder">
                <span>+</span>
                <p>Dosya Ekle (PDF, vb.)</p>
              </div>
            )}
          </label>
          <input
            id="event-file"
            type="file"
            onChange={handleFileChange}
            ref={eventFileInputRef}
            className="file-input"
          />
        </div>

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
