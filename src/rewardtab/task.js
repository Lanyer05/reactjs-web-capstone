import React, { useState, useEffect, useRef } from 'react';
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import '../Home.css';
import Sidebar from '../sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from '../config/firebase';
import AnimatedPage from '../AnimatedPage';

function Task() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const handleTrigger = () => setIsOpen(!isOpen);
  const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [points, setPoints] = useState('');
  const [tasksList, setTasksList] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const tasksCollectionRef = firestore.collection('tasks');
  const formContainerRef = useRef(null);
  const [showDeleteButtonId, setShowDeleteButtonId] = useState(null);
  const [updatedTaskName, setUpdatedTaskName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedLocation, setUpdatedLocation] = useState('');
  const [updatedHours, setUpdatedHours] = useState(0);
  const [updatedMinutes, setUpdatedMinutes] = useState(0);
  const [updatedPoints, setUpdatedPoints] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('TASK');
  

  useEffect(() => {
    const handleClickOutsideForm = (event) => {
      if (formContainerRef.current && !formContainerRef.current.contains(event.target)) {
        if (showAddForm) {
          setShowAddForm(false);
        }
        if (updatingTaskId !== null) {
          setUpdatingTaskId(null);
        }
      }
    };
    document.addEventListener('click', handleClickOutsideForm);
    return () => {
      document.removeEventListener('click', handleClickOutsideForm);
    };
  }, [showAddForm, updatingTaskId]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await tasksCollectionRef.get();
        const tasksData = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTasksList(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [tasksCollectionRef]);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        toast.error('Please login to access the tasks page.', { autoClose: 1500, hideProgressBar: true });
        navigate('/login');
      }
    };
    checkLoggedInUser();
  }, [navigate]);

  const handleAddTask = async () => {
    if (!taskName || !description || !location || !points) {
      setEmptyFieldWarning(true);
      toast.error('Please fill in all fields.', { autoClose: 1500, hideProgressBar: true });
      return;
    }

    try {
      const newTask = {
        taskName: taskName,
        description: description,
        location: location,
        timeFrame: { hours, minutes },
        points: points,
      };
      await tasksCollectionRef.add(newTask);
      setTasksList([...tasksList, newTask]);
      resetForm();
      setShowAddForm(false);
      toast.success('Task added successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const shouldDelete = window.confirm('Are you sure you want to delete this task?');
      if (!shouldDelete) {
        return;
      }
  
      await tasksCollectionRef.doc(taskId).delete();
      const updatedTasksList = tasksList.filter((task) => task.id !== taskId);
      setTasksList(updatedTasksList);
      toast.success('Task deleted successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task.', { autoClose: 1500, hideProgressBar: true });
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

  const handleTaskItemClick = (taskId) => {
    setSelectedTaskId((prevId) => (prevId === taskId ? null : taskId));
  };

  const handleRevealDeleteButton = (id) => {
    setShowDeleteButtonId((prevId) => (prevId === id ? null : id));
  };

  const handleUpdateTask = async (taskId) => {
    if (null) {
      toast.error('Please fill in all fields.', { autoClose: 1500, hideProgressBar: true });
      return;
    }

    try {
      await tasksCollectionRef.doc(taskId).update({
        taskName: updatedTaskName,
        description: updatedDescription,
        location: updatedLocation,
        timeFrame: { hours: updatedHours, minutes: updatedMinutes },
        points: updatedPoints,
      });

      const updatedTasksList = tasksList.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            taskName: updatedTaskName,
            description: updatedDescription,
            location: updatedLocation,
            timeFrame: { hours: updatedHours, minutes: updatedMinutes },
            points: updatedPoints,
          };
        }
        return task;
      });

      setTasksList(updatedTasksList);
      setSelectedTaskId(taskId);
      setUpdatingTaskId(null);
      toast.success('Task updated successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setLocation('');
    setHours(0);
    setMinutes(0);
    setPoints('');
    setEmptyFieldWarning(false);
  };

  const tabStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '10px 40px',
    margin: '0 1px',
    marginBottom: '5px',
    color: 'white',
    backgroundColor: '#588157',
    border: 'none',
    cursor: 'pointer',
    width: '160px',
    height: '40px',
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#34673d',
  };

  return (
    <AnimatedPage>
      <div className="home-container">
        <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />

        <div className="content">
          <h1 className="card-view">TASK PAGE</h1>

          <div className={`floating-form ${showAddForm ? 'visible' : ''}`} ref={formContainerRef}>
            <div className="form-container">
              <div className="form-group">
                <label htmlFor="taskName">Task:</label>
                <input
                  placeholder="Enter Task"
                  type="text"
                  id="taskName"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <input
                  placeholder="Enter Description"
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                  placeholder="Enter Location"
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="hours">Time Frame (Hours):</label>
                <input
                  type="number"
                  id="hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="minutes">Time Frame (Minutes):</label>
                <input
                  type="number"
                  id="minutes"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="points">Points:</label>
                <input
                  placeholder="Enter Points"
                  type="number"
                  id="points"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="form-control"
                />
              </div>
              <button onClick={handleAddTask} className="btn btn-primary">
                Add Task
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>

          <div className="tabs">
            <button
              style={selectedTab === 'TASK' ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange('TASK')}
            >
              Task
            </button>
            <button
              style={selectedTab === 'REQUEST' ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange('REQUEST')}
            >
              Request
            </button>
            <button
              style={selectedTab === 'CLAIM' ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange('CLAIM')}
            >
              Claim
            </button>
          </div>

          {selectedTab === 'TASK' && (
            <>
              <div className="tasks-container">
                <h2>Tasks List</h2>
                <div className="tasks-list">
                  {tasksList.map((task) => (
                    <div
                      key={task.id}
                      className={`task-item ${selectedTaskId === task.id ? 'selected' : ''}`}
                      onClick={() => handleTaskItemClick(task.id)}
                      onMouseEnter={() => handleRevealDeleteButton(task.id)}
                      onMouseLeave={() => handleRevealDeleteButton(null)}
                    >
                      <h3>{task.taskName}</h3>
                      <p>Description: {task.description}</p>
                      <p>Location: {task.location}</p>
                      <p>Time Frame: {task.timeFrame.hours} hours {task.timeFrame.minutes} minutes</p>
                      <p>Points: {task.points}</p>
                      {selectedTaskId === task.id && (
                        <>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className={`delete-button ${showDeleteButtonId === task.id ? 'visible' : ''}`}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setUpdatingTaskId(task.id)}
                            className={`update-button ${showDeleteButtonId === task.id ? 'visible' : ''}`}
                          >
                            Update
                          </button>
                        </>
                      )}
                      {updatingTaskId === task.id && (
                        <div className="update-form" onClick={(e) => e.stopPropagation()}>
                          <div className="form-group">
                            <input
                              type="text"
                              id="updatedTaskName"
                              placeholder="Updated Task"
                              value={updatedTaskName}
                              onChange={(e) => setUpdatedTaskName(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              id="updatedDescription"
                              placeholder="Updated Description"
                              value={updatedDescription}
                              onChange={(e) => setUpdatedDescription(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="text"
                              id="updatedLocation"
                              placeholder="Updated Location"
                              value={updatedLocation}
                              onChange={(e) => setUpdatedLocation(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="number"
                              id="updatedHours"
                              placeholder="Updated Hours"
                              value={updatedHours}
                              onChange={(e) => setUpdatedHours(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="number"
                              id="updatedMinutes"
                              placeholder="Updated Minutes"
                              value={updatedMinutes}
                              onChange={(e) => setUpdatedMinutes(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="number"
                              id="updatedPoints"
                              placeholder="Updated Points"
                              value={updatedPoints}
                              onChange={(e) => setUpdatedPoints(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <button onClick={() => handleUpdateTask(task.id)} className="btn btn-primary">
                            Update
                          </button>
                          <button onClick={() => setUpdatingTaskId(null)} className="btn btn-secondary">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="floating-button-container">
                {showAddForm ? (
                  <button onClick={() => setShowAddForm(false)} className="floating-add-button">
                    -
                  </button>
                ) : (
                  <button onClick={() => setShowAddForm(true)} className="floating-add-button">
                    +
                  </button>
                )}
              </div>
            </>
          )}

          {selectedTab === 'REQUEST' && (
            <div className="request-container">
              <h2>Request Content</h2>
              {/* Add content specific to the "REQUEST" tab */}
            </div>
          )}

          {selectedTab === 'CLAIM' && (
            <div className="claim-container">
              <h2>Claim Content</h2>
              {/* Add content specific to the "CLAIM" tab */}
            </div>
          )}
        </div>
        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
}

export default Task;