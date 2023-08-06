import React, { useState } from "react";
import firebase from './config/firebase';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faTrophy, faClipboardList, faVideo, faUserAlt, faSignOutAlt, faHome } from "@fortawesome/free-solid-svg-icons";
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
    <div className="home-container">
  
      <div className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}>
        <div className="trigger" onClick={handleTrigger}>
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
        </div>

        <div className={"sidebar-position"}>
          <img
            className="user-avatar"
            src="https://via.placeholder.com/30x30"
            alt="User Avatar"
          />
          <span>ADMIN</span>
        </div>

        <div className="sidebar-position" onClick={() => navigate('/home')}>
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
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

        <div className="sidebar-logout-position" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </div>
      </div>

     
      <div className="content">
        <h1 className="card-view">Welcome to the Dashboard</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
      </div>
    </div>
  );
}

export default Home;
