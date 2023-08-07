import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './login'; 
import Home from './home'; 
import Register from './register'; 
import Reward from './components/reward';
import Sidebar from './sidebar';
import PrivateRoute from './PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 

        <Route element={<PrivateRoute isLogged={true}/>}>
          <Route path="/home" element={<Home />} /> 
          <Route path="/reward" element={<Reward />} /> 
        </Route>
        
        <Route path="/sidebar" element={<Sidebar />} />
      </Routes>
    </Router>
  );
};

export default App;
