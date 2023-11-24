import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faGift, faClipboardList, faVideo, faUserAlt, faSignOutAlt, faHome, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase/app";
import "firebase/auth";
import LogoImage from "./logowhite.png"; 

function Sidebar({ isOpen, handleTrigger, navigate, handleLogout }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const getUsernameFromEmail = (email) => {
    const atIndex = email.indexOf("@");
    if (atIndex !== -1) {
      return email.substring(0, atIndex);
    }
    return email;
  };

  return (
    <div className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}>
      <div className="trigger" onClick={handleTrigger}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </div>

      <div className="sidebar-position" data-tooltip={currentUser ? currentUser.email : "Guest"} onClick={() => navigate('/guest')} style={{ marginBottom: "50px" }}>
  <img
    className="user-avatar"
    src={LogoImage}
    alt="User Avatar"
    style={{ width: "30px", height: "30px" }}
  />
  <span>{currentUser ? getUsernameFromEmail(currentUser.email) : "Guest"}</span>
</div>

      <div className="sidebar-position" data-tooltip="Home" onClick={() => navigate('/home')}>
          <FontAwesomeIcon icon={faHome} />
          <span>HOME</span>
        </div>

      <div className="sidebar-position" data-tooltip="Rewards" onClick={() => navigate('/reward')}>
        <FontAwesomeIcon icon={faGift} />
        <span>REWARDS</span>
      </div>

      <div className="sidebar-position" data-tooltip="Task" onClick={() => navigate('/task')}>
        <FontAwesomeIcon icon={faClipboardList} />
        <span>TASK</span>
      </div>

      <div className="sidebar-position" data-tooltip="Camera" onClick={() => navigate('/cctv')}>
        <FontAwesomeIcon icon={faVideo} />
        <span>CAMERA</span>
      </div>

      <div className="sidebar-position" data-tooltip="Users" onClick={() => navigate('/user')}>
        <FontAwesomeIcon icon={faUserAlt} />
        <span>USERS</span>
      </div>

      <div className="sidebar-position" data-tooltip="Announcement" onClick={() => navigate('/announcement')}>
        <FontAwesomeIcon icon={faBullhorn} />
        <span>ANNOUNCEMENT</span>
      </div>

      <div className="sidebar-logout-position" onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} />
        <span>LOG OUT</span>
      </div>
    </div>
  );
}

export default React.memo(Sidebar);
