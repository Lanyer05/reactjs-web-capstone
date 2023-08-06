import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './login'; 
import Home from './home'; 
import Register from './register'; 
import Reward from './reward';
import Sidebar from './sidebar';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/home" element={<Home />} /> 
        <Route path="/register" element={<Register />} /> 

        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/reward" element={<Reward />} /> 
      </Routes>
    </Router>
  );
};

export default App;