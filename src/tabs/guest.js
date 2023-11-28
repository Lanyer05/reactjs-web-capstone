import React, { useEffect, useState } from 'react';
import AnimatedPage from "../AnimatedPage";
import firebase from '../config/firebase';
import Logos from '../5333978.jpg';

const Guest = ({ userEmail }) => {
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    const firestore = firebase.firestore();
    const usersCollection = firestore.collection('users');

    const fetchCurrentUser = async () => {
      if (userEmail) {
        const userDoc = await usersCollection.doc(userEmail).get();
        if (userDoc.exists) {
          fetchCurrentUser({
            id: userDoc.id,
            email: userDoc.data().email,
            uid: userDoc.data().uid, // Add the uid field
          });
        }
      }
    };

    const unsubscribe = usersCollection.onSnapshot((snapshot) => {
      const adminUsersData = snapshot.docs
        .filter((doc) => doc.data().email.endsWith('@youradmin.com'))
        .map((doc) => ({
          id: doc.id,
          email: doc.data().email,
          uid: doc.data().uid, // Include the uid field
        }));

      setAdminUsers(adminUsersData);
    });

    fetchCurrentUser();
    return () => unsubscribe();
  }, [userEmail]);

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
        <img src={Logos} alt="Welcome"style={{position: 'fixed',bottom: 0,left: 0,width: '100%',height: 'auto',objectFit: 'cover',zIndex: -1,opacity: 0.4,}}/>
          <h1 className="card-view">Welcome Admins</h1>
          <div className="approved-container">
            <h2>Admin Users:</h2>
            <div className="users-list">
              {adminUsers.map((user) => (
                <div key={user.id} className="user-approved-item">
                  <p>
                    <span className="label">Email: </span>
                    {user.email}
                 </p>
                 <p>
                    <span className="label">Admin ID: </span>
                    {user.uid}
                 </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Guest;
