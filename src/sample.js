import React, { useState } from "react";
import firebase from './config/firebase';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBars, faTimes, faTrophy, faClipboardList, faVideo, faUserAlt, faSignOutAlt} 
from "@fortawesome/free-solid-svg-icons";
import "./Home.css";

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const handleTrigger = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      console.log('Logout successful.');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (  
    <div className="App">
      <div className="page">
        <div className="content">
          <div className="card-view">
            <h1>REWARD LIST</h1>
          </div>
        </div>
    
  <div className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
  <div className="trigger" onClick={handleTrigger}>
    <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
  </div>

  <div className={"sidebar-position"}>
      <img
        className="user-avatar"
        src="https://via.placeholder.com/30x30"
        alt="User Avatar"/>
      <span>ADMIN</span>
    </div>

    <div className="sidebar-position" onClick={() => navigate('/reward')}>
      <FontAwesomeIcon icon={faTrophy} />
    <span>REWARD</span>
      </div>

    <div className="sidebar-position" onClick={() => navigate('/task')}>
      <FontAwesomeIcon icon={faClipboardList} />
    <span>TASK</span>
      </div>

    <div className="sidebar-position" onClick={() => navigate('/cctv-preview')}>
      <FontAwesomeIcon icon={faVideo} />
    <span>CCTV PREVIEW</span>
      </div>

    <div className="sidebar-position" onClick={() => navigate('/user-verification')}>
      <FontAwesomeIcon icon={faUserAlt} />
    <span>USERS VERIFICATION</span>
     </div>
  
  <div
  className="sidebar-position"
  onClick={handleLogout}
  style={{
    position: "absolute",
    bottom: "0",
    width: "100%",
    display: "flex",
    bottom: "10px"
  }}
>
  <FontAwesomeIcon icon={faSignOutAlt} />
  <span>Logout</span>
      </div>
    </div>
  </div>
</div>

  );
}

export default Home;