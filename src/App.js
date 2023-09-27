import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Login from './login'; 
import Home from './home'; 
import Register from './register'; 
import Reward from './tabs/reward';
import Task from './tabs/task';
import User from './tabs/user';
import Sidebar from './sidebar';
import PrivateRoute from './PrivateRoute';
import Cctv from './tabs/cctv';
import firebase from './config/firebase';
import "./css/Home.css";
import ForegroundNotificationReceiver from './ForegroundNotificationReceiver';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const handleTrigger = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      console.log('Logout successful.');
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const shouldDisplaySidebar = !['/', '/login', '/register'].includes(location.pathname) && isLoggedIn;

  return (
    <div>
      {shouldDisplaySidebar && (
        <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />
      )}
      <div className="content">
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {isLoggedIn ? (
            <Route element={<PrivateRoute isLogged={true}/>}>
              <Route path="/home" element={<Home />} /> 
              <Route path="/reward" element={<Reward />} /> 
              <Route path="/task" element={<Task />} /> 
              <Route path="/user" element={<User />} /> 
              <Route path="/cctv" element={<Cctv />} />
            </Route>
          ) : (
            <Route path="*" element={<Login />} />
          )}
        </Routes>
      </div>
      <ForegroundNotificationReceiver />
    </div>
  );
}

export default React.memo(App);
