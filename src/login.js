import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import firebase from './config/firebase';
import "./design.css";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
  
    try {
      const { user } = await firebase.auth().signInWithEmailAndPassword(email, password);
      console.log('Successful!');
      if (user && user.email) {
        if (user.email.endsWith("youradmin.com")) {
          showLoginSuccessToast();
          navigate("/home");
        } else {
          showToast("Only admin accounts are allowed.", "error");
          await firebase.auth().signOut(); 
        }
      } else {
        showToast("Unable to log in. Please try again later.", "error");
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      console.error('Error code:', error.code);
      if (error.code === "auth/wrong-password") {
        showToast("Invalid password. Please try again.", "error");
      } else if (error.code === "auth/user-not-found") {
        showToast("User not found. Please check your credentials.", "error");
      } else {
        showToast("Error logging in. Please try again later.", "error");
      }
    }
  };
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showToast = (message, type) => {
    toast[type](message, {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
    
  };
  
  const showLoginSuccessToast = () => {
    toast.success("Login Successful!", {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  };

  return (
    <div className="login-container">
      <h1 className="welcome-text">WELCOME</h1>
      <img className="welcome-image" src="https://via.placeholder.com/317x227" alt="Welcome" />
      <div className="welcome-message">Go Green, Go Clean!</div>
      <form onSubmit={handleLogin}>
        <div className="input-container">
          <div className="input-field">
            <input
              type="email"
              placeholder=" Enter Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder=" Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="button-container"></div>
        <button className="login-button" type="submit">SIGN IN</button>
        <p className="forgot-password">
          Dont have an admin account? <Link className="forgot-password" to="/register">Register here</Link>.
        </p>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;