import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './login'; 
import Home from './home'; 
import Register from './register'; 
import Reward from './tabs/reward';
import Task from './tabs/task';
import User from './tabs/user';
import Sidebar from './sidebar';
import PrivateRoute from './PrivateRoute';
import Cctv from './tabs/cctv';
import ForegroundNotificationReceiver from './ForegroundNotificationReceiver';

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
          <Route path="/task" element={<Task />} /> 
          <Route path="/user" element={<User />} /> 
          <Route path="/cctv" element={<Cctv/>}/>
        </Route>
        
        <Route path="/sidebar" element={<Sidebar />} />
      </Routes>
      <ForegroundNotificationReceiver />
    </Router>
  );
};

export default React.memo(App);
