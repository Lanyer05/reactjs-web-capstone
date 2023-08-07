import React, { useState, useEffect } from 'react';
import firebase from './config/firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';

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

  
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        
        navigate('/login');
      }
    };

    checkLoggedInUser();
  }, [navigate]);

 
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        setIsLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  if (isLoading) {
    
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />

      <div className="content">
        <h1 className="card-view">WELCOME TO HOMEPAGE</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
      </div>
    </div>
  );
}

export default Home;
