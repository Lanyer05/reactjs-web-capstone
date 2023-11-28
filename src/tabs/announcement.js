import React, { useState, useEffect } from 'react';
import firebase from '../config/firebase';
import AnimatedPage from '../AnimatedPage';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Home.css';
import Logos from '../5333978.jpg';

const AnnouncementForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        toast.error('Please login to access the announcement page.', {
          autoClose: 1500,
          hideProgressBar: true,
        });
        navigate('/login');
      }
    };
    checkLoggedInUser();
  }, [navigate]);

  useEffect(() => {
    const db = firebase.firestore();
    const announcementsRef = db.collection('announcements');
    const unsubscribe = announcementsRef.onSnapshot((querySnapshot) => {
      const announcementsData = [];
      querySnapshot.forEach((doc) => {
        announcementsData.push({ id: doc.id, ...doc.data() });
      });
      setAnnouncements(announcementsData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddAnnouncement = () => {
    if (!title || !description) {
      toast.error('Title and description cannot be empty.', {
        autoClose: 1500,
        hideProgressBar: true,
      });
      return;
    }
  
    if (window.confirm('Are you sure you want to add/update this announcement?')) {
      const db = firebase.firestore();
      const batch = db.batch();
  
      if (currentAnnouncement) {
        const announcementRef = db.collection('announcements').doc(currentAnnouncement.id);
        batch.update(announcementRef, {
          title: title,
          description: description,
        });
        batch
          .commit()
          .then(() => {
            console.log('Announcement updated with ID: ', currentAnnouncement.id);
            setTitle('');
            setDescription('');
            setCurrentAnnouncement(null);
          })
          .catch((error) => {
            console.error('Error updating announcement: ', error);
          });
      } else {
        const newAnnouncementRef = db.collection('announcements').doc();
        batch.set(newAnnouncementRef, {
          title: title,
          description: description,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        batch
          .commit()
          .then(() => {
            console.log('Announcement added with ID: ', newAnnouncementRef.id);
            setTitle('');
            setDescription('');
          })
          .catch((error) => {
            console.error('Error adding announcement: ', error);
          });
      }
    }
  };
  

  const handleEditAnnouncement = (announcement) => {
    if (window.confirm('Are you sure you want to edit this announcement?')) {
      setTitle(announcement.title);
      setDescription(announcement.description);
      setCurrentAnnouncement(announcement);
    }
  };

  const handleDeleteAnnouncement = (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      const db = firebase.firestore();
      const batch = db.batch();

      const announcementRef = db.collection('announcements').doc(announcementId);
      batch.delete(announcementRef);

      batch
        .commit()
        .then(() => {
          console.log('Announcement deleted with ID: ', announcementId);
        })
        .catch((error) => {
          console.error('Error deleting announcement: ', error);
        });
    }
  };

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
        <img src={Logos} alt="Welcome"style={{position: 'fixed',bottom: 0,left: 0,width: '100%',height: 'auto',objectFit: 'cover',zIndex: -1,opacity: 0.4,}}/>
          <h1 className="card-view">WELCOME TO ANNOUNCEMENTS</h1>
          <div className="annoucement-container">
            <div className="centered-container">
            <h2>{currentAnnouncement ? 'Update Announcement' : 'Add Announcement'}</h2>
            <div>
              <input
                className="form-control"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ backgroundColor: 'white' }}
              />
            </div>
            <div>
              <textarea
                className="input-field"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              className="login-button"
              onClick={handleAddAnnouncement}
              style={{ marginBottom: '15px' }}
            >
              {currentAnnouncement ? 'Update' : 'Add'}
            </button>
          </div>
            <div className="announcement-list">
            {announcements.slice().reverse().map((announcement) => (
                <div key={announcement.id} className="announcement-item">
                  <h3>{announcement.title}</h3>
                  <p>{announcement.description}</p>
                  <button
                    onClick={() => handleEditAnnouncement(announcement)}
                    className="confirm-button"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
};

export default React.memo(AnnouncementForm);
