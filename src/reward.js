import React, { useState, useEffect } from "react";
import firebase from './config/firebase';
import { useNavigate } from 'react-router-dom';
import "./Home.css";
import Sidebar from "./sidebar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from "./config/firebase";

function Reward() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const handleTrigger = () => setIsOpen(!isOpen);
  const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
  const navigate = useNavigate();

  const [rewardName, setRewardName] = useState("");
  const [points, setPoints] = useState("");
  const [rewardsList, setRewardsList] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [selectedRewardId, setSelectedRewardId] = useState(null); 

  const rewardsCollectionRef = firestore.collection("rewards");

  useEffect(() => {
    let isMounted = true;

    const fetchRewards = async () => {
      try {
        const rewardsSnapshot = await rewardsCollectionRef.get();
        const rewardsData = rewardsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        if (isMounted) {
          setRewardsList(rewardsData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching rewards:", error);
        setLoading(false);
      }
    };

    fetchRewards();

    return () => {
      isMounted = false; 
    };
  }, );

  const handleAddReward = async () => {
    if (!rewardName || !points) {
      setEmptyFieldWarning(true);
      toast.error('Please fill in both Reward and Points.', { autoClose: 1500, hideProgressBar: true });
      return;
    }

    const newReward = {
      rewardName: rewardName,
      points: points
    };

    try {
      await rewardsCollectionRef.add(newReward);
      const rewardsSnapshot = await rewardsCollectionRef.get();
      const updatedRewardsData = rewardsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setRewardsList(updatedRewardsData);
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

  return (
    <div className="home-container">
      <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />
     
      <div className="content">
        <h1 className="card-view">Welcome to the Reward Page</h1>
        {showAddForm ? (
          <div className="floating-form">
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="rewardName">Reward Name:</label>
              <input
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
                type="number"
                id="points"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="form-control"
              />
            </div> {emptyFieldWarning && <p className="warning-text"></p>}
            <button onClick={handleAddReward} className="btn btn-primary">
              Add Reward
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
        ) : (
          <div className="floating-button-container">
            <button onClick={() => setShowAddForm(true)} className="floating-add-button">
              +
            </button>
          </div>
        )}
       
       {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="rewards-container">
            <h2>Rewards List</h2>
            <div className="rewards-list">
              {rewardsList.map((reward) => (
                <div
                  key={reward.id}
                  className={`reward-item ${selectedRewardId === reward.id ? 'selected' : ''}`}
                  onClick={() => handleRewardClick(reward.id)}
                >
                  <h3>{reward.rewardName}</h3>
                  <p>Points: {reward.points}</p>
                  {selectedRewardId === reward.id && (
                    <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="delete-button">
                        Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ToastContainer autoClose={1500} hideProgressBar />
    </div>
  );
}

export default Reward;
