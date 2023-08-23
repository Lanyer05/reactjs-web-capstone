import React, { useState, useEffect, useRef } from "react";
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import "../css/Home.css";
import Sidebar from "../sidebar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from "../config/firebase";
import AnimatedPage from "../AnimatedPage";

function User() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const handleTrigger = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  const rewardsCollectionRef = firestore.collection("users");
  const formContainerRef = useRef(null);
  const [updatingRewardId, setUpdatingRewardId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("REQUEST");
  const [userRequests, setUserRequests] = useState([]);
  const [userApproved, setUserApproved] = useState([]);

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      console.log('Logout successful.');
      navigate('/login');
      } catch (error) {
      console.error('Logout failed:', error);
      }
    };
    

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
    const fetchUserRequests = async () => {
        try {
        const userRequestsSnapshot = await firestore.collection("registration_requests").get();
        const userRequestsData = userRequestsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserRequests(userRequestsData);
        } catch (error) {
        console.error("Error fetching user requests:", error);
        }
        };
        fetchUserRequests();
  }, []);


  useEffect(() => {
    const fetchUserApproved = async () => {
        try {
        const userApprovedSnapshot = await firestore.collection("users").get();
        const userApprovedData = userApprovedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserApproved(userApprovedData);
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
      await requestRef.update({ isApproved: true });
      const approvedRequestSnapshot = await requestRef.get();
      const approvedRequestData = approvedRequestSnapshot.data();
      if (approvedRequestData) {
        const userRef = firestore.collection("users").doc(approvedRequestData.Uid);
        await firestore.runTransaction(async (transaction) => {
          transaction.delete(requestRef);
          transaction.set(userRef, approvedRequestData);
          });
          setUserRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId));
          toast.success("Request approved successfully!", {
          autoClose: 1500,
          hideProgressBar: true,
          });
          } else {
          toast.error("Failed to approve request.", {
          autoClose: 1500,
          hideProgressBar: true,
          });
          }
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
      const user = firebase.auth().currentUser;
      if (user) {
        await user.delete();
        }
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


  const tabStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    padding: "10px 40px",
    margin: "0 1px",
    marginBottom: "5px",
    color: "white",
    backgroundColor: "#588157",
    border: "none",
    cursor: "pointer",
    width: "210px",
    height: "40px",
  };
  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "#34673d",
  };


  useEffect(() => {
    const unsubscribeRequests = firestore.collection('registration_requests').onSnapshot(snapshot => {
      const userRequestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserRequests(userRequestsData);
      });
      const unsubscribeUsers = firestore.collection('users').onSnapshot(snapshot => {
      const userApprovedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserApproved(userApprovedData);
      });
      return () => {
      unsubscribeRequests();
      unsubscribeUsers();
      };
  }, []);


  return (
    <AnimatedPage>
      <div className="home-container">
        <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />
        <div className="content">
          <h1 className="card-view">USER PAGE</h1>
          <div className="tabs">
            <button
              style={selectedTab === "REQUEST" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("REQUEST")}
              >
              User Request
              </button>
              <button
              style={selectedTab === "APPROVED" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("APPROVED")}
              >
              User Approved
              </button>
          </div>


          {selectedTab === "REQUEST" && (
            <div className="request-container">
              <h2>User Request List</h2>
              <div className="user-request-list">
                {userRequests.map((request) => (
                  <div key={request.id} className="user-request-item">
                    <h3>{request.name}</h3>
                    <p>User ID: {request.Uid}</p>
                    <p>Barangay: {request.Barangay}</p>
                    <p>Email: {request.email}</p>
                    {!request.isApproved && (
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="delete-button"
                        >
                        Approve
                      </button>
                    )}
                  </div>
                  ))}
                {userRequests.length === 0 && <p>No tasks found.</p>} 
              </div>
            </div>
          )}


          {selectedTab === 'APPROVED' && (
            <div className="approved-container">
              <h2>Approved Users List</h2>
              <div className="user-approved-list">
                {userApproved.map((approved) => (
                  <div key={approved.id} className="user-approved-item">
                    <h3>{approved.name}</h3>
                    <p>User ID: {approved.Uid}</p>
                    <p>Barangay: {approved.Barangay}</p>
                    <p>Email: {approved.email}</p>
                    <button
                      onClick={() => handleDeleteUserApproved(approved.id)}
                      className="delete-button"
                      >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
}
export default User;