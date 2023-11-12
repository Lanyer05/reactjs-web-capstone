import React, { useState, useEffect, useRef } from "react";
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import "../css/Home.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from "../config/firebase";
import AnimatedPage from "../AnimatedPage";
import emailjs from '@emailjs/browser';

function User() {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const formContainerRef = useRef(null);
  const [updatingRewardId, setUpdatingRewardId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("REQUEST");
  const [userRequests, setUserRequests] = useState([]);
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

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };


  const handleApproveRequest = async (requestId) => {
    try {
      const shouldApprove = window.confirm('Are you sure you want to approve this request?');
      if (!shouldApprove) {
        return;
      }
      const requestRef = firestore.collection("registration_requests").doc(requestId);
      const approvedRequestSnapshot = await requestRef.get();
      const approvedRequestData = approvedRequestSnapshot.data();
      if (approvedRequestData) {
        await requestRef.delete();
        const userRef = firestore.collection("users").doc(approvedRequestData.Uid);
        const userData = {
          ...approvedRequestData,
          userpoints: 0,
          isApproved: true,
        };
        await userRef.set(userData);
  
        const emailServiceId = 'service_d5y2lkk';
        const emailTemplateId = 'template_p73t06c';
        const publicKey = '5kY0O_JTs3pjxp8WC';
  
        const emailParams = {
          to_email: approvedRequestData.email,
          subject: 'Request Approval Notification',
          message: 'Your account registration request has been approved.',
        };
        await emailjs.send(emailServiceId, emailTemplateId, emailParams, publicKey);
      }
  
      setUserRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId));
      toast.success("Request approved successfully!", {
        autoClose: 1500,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request.", {
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  };
  

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
          <h1 className="card-view">USER PAGE</h1>
            <div className="approved-container">
              <h2>Approved Users List</h2>
              <div className="user-approved-list">
              {userApproved
                   .filter((approved) => !approved.email.endsWith('@youradmin.com'))
                  .map((approved) => (
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