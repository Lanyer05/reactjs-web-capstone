import React, { useState, useEffect, useRef } from "react";
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import "../css/Home.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from "../config/firebase";
import AnimatedPage from "../AnimatedPage";
import emailjs from '@emailjs/browser';
import Logos from '../5333978.jpg';

function User() {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const formContainerRef = useRef(null);
  const [updatingRewardId, setUpdatingRewardId] = useState(null);
  const [userApproved, setUserApproved] = useState([]);

  useEffect(() => {
    const handleClickOutsideForm = (event) => {
      if (formContainerRef.current && !formContainerRef.current.contains(event.target)) {
        if (showAddForm) {
          setShowAddForm(false);
        }
        if (updatingRewardId !== null) {
          setUpdatingRewardId(null);
        }
      }
    };
    document.addEventListener("click", handleClickOutsideForm);
    return () => {
      document.removeEventListener("click", handleClickOutsideForm);
    };
  }, [showAddForm, updatingRewardId]);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        toast.error('Please login to access the rewards page.', { autoClose: 1500, hideProgressBar: true });
        navigate('/login');
      }
    };
    checkLoggedInUser();
  }, [navigate]);


  useEffect(() => {
    const fetchUserApproved = async () => {
      try {
        if (userApproved.length === 0) {
          const userApprovedSnapshot = await firestore.collection("users").get();
          const userApprovedData = userApprovedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setUserApproved(userApprovedData);
        }
      } catch (error) {
        console.error("Error fetching user approved requests:", error);
      }
    };
    fetchUserApproved();
  }, []);

  const handleDeleteUserApproved = async (userId) => {
    try {
      const shouldDelete = window.confirm('Are you sure you want to delete this user?');
      if (!shouldDelete) {
        return;
      }
      await firestore.collection('users').doc(userId).delete();
      setUserApproved(userApproved.filter((user) => user.id !== userId));
      toast.success('User deleted successfully!', {
        autoClose: 1500,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.', {
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  };


  useEffect(() => {
    const userApprovedListener = firestore.collection("users").onSnapshot((snapshot) => {
      const userApprovedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserApproved(userApprovedData);
    });

    return () => {
      userApprovedListener();
    };
  }, []);

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
        <img src={Logos} alt="Welcome"style={{position: 'fixed',bottom: 0,left: 0,width: '100%',height: 'auto',objectFit: 'cover',zIndex: -1,opacity: 0.4,}}/>
          <h1 className="card-view">USER PAGE</h1>
            <div className="approved-container">
              <h2>Approved Users List</h2>
              <div className="user-approved-list">
              {userApproved
                .filter((approved) => !approved.email.endsWith('@youradmin.com')).slice().reverse().map((approved) => (
                  <div key={approved.id} className="user-approved-item">
                    <h3>{approved.name}</h3>
                    <p>User ID: {approved.Uid}</p>
                    <p>Barangay: {approved.Barangay}</p>
                    <p>Email: {approved.email}</p>
                    <p>Points: {approved.userpoints}</p>
                    <button
                      onClick={() => handleDeleteUserApproved(approved.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {userApproved.length === 0 && <p>No User found.</p>}
              </div>
            </div>
        </div>
        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
}

export default React.memo(User);