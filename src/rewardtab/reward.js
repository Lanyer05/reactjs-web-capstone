import React, { useState, useEffect, useRef } from "react";
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import "../Home.css";
import Sidebar from "../sidebar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from "../config/firebase";
import AnimatedPage from "../AnimatedPage";

function Reward() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const handleTrigger = () => setIsOpen(!isOpen);
  const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
  const navigate = useNavigate();
  const [rewardName, setRewardName] = useState("");
  const [points, setPoints] = useState("");
  const [rewardsList, setRewardsList] = useState([]);
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const rewardsCollectionRef = firestore.collection("rewards");
  const formContainerRef = useRef(null);
  const [showDeleteButtonId, setShowDeleteButtonId] = useState(null);
  const [updatedRewardName, setUpdatedRewardName] = useState("");
  const [updatedRewardPoints, setUpdatedRewardPoints] = useState("");
  const [updatingRewardId, setUpdatingRewardId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("REWARD");

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
    const fetchRewards = async () => {
      try {
        const rewardsSnapshot = await rewardsCollectionRef.get();
        const rewardsData = rewardsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRewardsList(rewardsData);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };
    fetchRewards();
  }, [rewardsCollectionRef]);

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

  const handleAddReward = async () => {
    if (!rewardName || !points) {
      setEmptyFieldWarning(true);
      toast.error('Please fill in both Reward and Points.', { autoClose: 1500, hideProgressBar: true });
      return;
    }

    try {
      const newReward = {
        rewardName: rewardName,
        points: points
      };
      await rewardsCollectionRef.add(newReward);
      setRewardsList([...rewardsList, newReward]);
      setRewardName("");
      setPoints("");
      setEmptyFieldWarning(false);
      toast.success('Reward added successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error("Error adding reward:", error);
      toast.error('Failed to add reward.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleDeleteReward = async (id) => {
    try {
      await rewardsCollectionRef.doc(id).delete();
      const updatedRewardsList = rewardsList.filter((reward) => reward.id !== id);
      setRewardsList(updatedRewardsList);
      toast.success('Reward deleted successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast.error('Failed to delete reward.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      console.log('Logout successful.');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRewardClick = (id) => {
    setSelectedRewardId((prevId) => (prevId === id ? null : id));
  };

  const handleRevealDeleteButton = (id) => {
    setShowDeleteButtonId((prevId) => (prevId === id ? null : id));
  };

  const handleUpdateReward = async (id) => {
    if (!updatedRewardName || !updatedRewardPoints) {
      toast.error('Please fill in both Reward and Points.', { autoClose: 1500, hideProgressBar: true });
      return;
    }
    try {
      await rewardsCollectionRef.doc(id).update({
        rewardName: updatedRewardName,
        points: updatedRewardPoints,
      });

      const updatedRewardsList = rewardsList.map((reward) => {
        if (reward.id === id) {
          return {
            ...reward,
            rewardName: updatedRewardName,
            points: updatedRewardPoints,
          };
        }
        return reward;
      });

      setRewardsList(updatedRewardsList);
      setSelectedRewardId(id);
      setUpdatingRewardId(null);
      toast.success('Reward updated successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error("Error updating reward:", error);
      toast.error('Failed to update reward.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
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
    width: "160px",
    height: "40px",
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "#34673d",
  };

  return (
    <AnimatedPage>
      <div className="home-container">
        <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />

        <div className="content">
          <h1 className="card-view">REWARD PAGE</h1>

          <div className={`floating-form ${showAddForm ? 'visible' : ''}`} ref={formContainerRef}>
            <div className="form-container">
              <div className="form-group">
                <label htmlFor="rewardName">Reward:</label>
                <input
                  placeholder="Enter Reward"
                  type="text"
                  id="rewardName"
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="points">Points:</label>
                <input
                  placeholder="Enter Points"
                  type="number"
                  id="points"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="form-control"
                />
              </div>
              <button onClick={handleAddReward} className="btn btn-primary">
                Add Reward
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>

          <div className="tabs">
            <button
              style={selectedTab === "REWARD" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("REWARD")}
            >
              Reward
            </button>
            <button
              style={selectedTab === "REQUEST" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("REQUEST")}
            >
              Request
            </button>
            <button
              style={selectedTab === "CLAIM" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("CLAIM")}
            >
              Claim
            </button>
          </div>

          {selectedTab === "REWARD" && (
            <>
              <div className="rewards-container">
                <h2>Rewards List</h2>
                <div className="rewards-list">
                  {rewardsList.map((reward) => (
                    <div
                      key={reward.id}
                      className={`reward-item ${selectedRewardId === reward.id ? 'selected' : ''}`}
                      onClick={() => handleRewardClick(reward.id)}
                      onMouseEnter={() => handleRevealDeleteButton(reward.id)}
                      onMouseLeave={() => handleRevealDeleteButton(null)}
                    >
                      <h3>{reward.rewardName}</h3>
                      <p>Points: {reward.points}</p>
                      {selectedRewardId === reward.id && (
                        <>
                          <button
                            onClick={() => handleDeleteReward(reward.id)}
                            className={`delete-button ${showDeleteButtonId === reward.id ? 'visible' : ''}`}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setUpdatingRewardId(reward.id)}
                            className={`update-button ${showDeleteButtonId === reward.id ? 'visible' : ''}`}
                          >
                            Update
                          </button>
                        </>
                      )}
                      {updatingRewardId === reward.id && (
                        <div className="update-form" onClick={(e) => e.stopPropagation()}>
                          <div className="form-group">
                            <input
                              type="text"
                              id="updatedRewardName"
                              placeholder="Updated Reward"
                              value={updatedRewardName}
                              onChange={(e) => setUpdatedRewardName(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="number"
                              id="updatedRewardPoints"
                              placeholder="Updated Points"
                              value={updatedRewardPoints}
                              onChange={(e) => setUpdatedRewardPoints(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <button onClick={() => handleUpdateReward(reward.id)} className="btn btn-primary">
                            Update
                          </button>
                          <button onClick={() => setUpdatingRewardId(null)} className="btn btn-secondary">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="floating-button-container">
                {showAddForm ? (
                  <button onClick={() => setShowAddForm(false)} className="floating-add-button">
                    -
                  </button>
                ) : (
                  <button onClick={() => setShowAddForm(true)} className="floating-add-button">
                    +
                  </button>
                )}
              </div>
            </>
          )}

          {selectedTab === "REQUEST" && (
            <div className="request-container">
              <h2>Request Content</h2>
              {/* Add content specific to the "REQUEST" tab */}
            </div>
          )}

          {selectedTab === "CLAIM" && (
            <div className="claim-container">
              <h2>Claim Content</h2>
              {/* Add content specific to the "CLAIM" tab */}
            </div>
          )}
        </div>
        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
}

export default Reward;