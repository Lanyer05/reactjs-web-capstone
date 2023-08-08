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
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const handleTrigger = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [points, setPoints] = useState('');
  const formContainerRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState('TASK');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updatedTaskName, setUpdatedTaskName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedLocation, setUpdatedLocation] = useState('');
  const [updatedHours, setUpdatedHours] = useState(0);
  const [updatedMinutes, setUpdatedMinutes] = useState(0);
  const [updatedPoints, setUpdatedPoints] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const snapshot = await firestore.collection('tasks').get();
        const fetchedTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const handleClickOutsideForm = (event) => {
      if (formContainerRef.current && !formContainerRef.current.contains(event.target)) {
        if (showAddForm) {
          setShowAddForm(false);
          resetForm();
        }
        if (showUpdateForm) {
          setShowUpdateForm(false);
          resetUpdateForm();
        }
      }
    };

    document.addEventListener('click', handleClickOutsideForm);
    return () => {
      document.removeEventListener('click', handleClickOutsideForm);
    };
  }, [showAddForm, showUpdateForm]);

  const handleAddTask = async () => {
    if (!taskName || !description || !location || !points) {
      toast.error('Please fill in all fields.', { autoClose: 1500, hideProgressBar: true });
      return;
    }

    try {
      await firestore.collection('tasks').add({
        taskName,
        description,
        location,
        timeFrame: { hours, minutes },
        points: parseInt(points),
      });
      resetForm();
      toast.success('Task added successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await firestore.collection('tasks').doc(taskId).delete();
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success('Task deleted successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleUpdateTask = async (taskId) => {
    if (!updatedTaskName || !updatedDescription || !updatedLocation || !updatedPoints) {
      toast.error('Please fill in all fields.', { autoClose: 1500, hideProgressBar: true });
      return;
    }

    try {
      await firestore.collection('tasks').doc(taskId).update({
        taskName: updatedTaskName,
        description: updatedDescription,
        location: updatedLocation,
        timeFrame: { hours: updatedHours, minutes: updatedMinutes },
        points: parseInt(updatedPoints),
      });

      const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            taskName: updatedTaskName,
            description: updatedDescription,
            location: updatedLocation,
            timeFrame: { hours: updatedHours, minutes: updatedMinutes },
            points: parseInt(updatedPoints),
          };
        }
        return task;
      });

      setTasks(updatedTasks);
      setUpdatingTaskId(null);
      setShowUpdateForm(false);
      setIsUpdateFormOpen(false);
      resetUpdateForm();
      toast.success('Task updated successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setLocation('');
    setHours(0);
    setMinutes(0);
    setPoints('');
  };

  const resetUpdateForm = () => {
    setUpdatedTaskName('');
    setUpdatedDescription('');
    setUpdatedLocation('');
    setUpdatedHours(0);
    setUpdatedMinutes(0);
    setUpdatedPoints('');
  };

  const handleHoursChange = (e) => {
    const newHours = parseInt(e.target.value);
    if (newHours >= 0 && newHours <= 24) {
      setHours(newHours);
    }
  };

  const handleMinutesChange = (e) => {
    const newMinutes = parseInt(e.target.value);
    if (newMinutes >= 0 && newMinutes <= 59) {
      setMinutes(newMinutes);
    }
  };

  const handleUpdatedHoursChange = (e) => {
    const newHours = parseInt(e.target.value);
    if (newHours >= 0 && newHours <= 24) {
      setUpdatedHours(newHours);
    }
  };

  const handleUpdatedMinutesChange = (e) => {
    const newMinutes = parseInt(e.target.value);
    if (newMinutes >= 0 && newMinutes <= 59) {
      setUpdatedMinutes(newMinutes);
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setShowAddForm(false);
    resetForm();
    setShowUpdateForm(false);
    resetUpdateForm();
    setIsUpdateFormOpen(false);
  };

  const handleTaskItemClick = (taskId) => {
    if (isUpdateFormOpen) {
      if (updatingTaskId === taskId) {
        setIsUpdateFormOpen(false);
        setUpdatingTaskId(null);
      }
    } else if (selectedTask === taskId) {
      setSelectedTask(null);
    } else {
      setSelectedTask(taskId);
    }
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
    width: '170px',
    height: '40px',
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#34673d',
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

  return (
    <AnimatedPage>
      <div className="home-container">
        <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />

        <div className="content">
          <h1 className="card-view">TASK PAGE</h1>

          <div className={`floating-form ${showAddForm ? 'visible' : ''}`} ref={formContainerRef}>
            {/* ... (existing form inputs) */}
          </div>

          <div className="tabs">
            {/* ... (existing tab buttons) */}
          </div>

          {selectedTab === 'TASK' && (
            <>
              <div className="task-container">
                <h2>Task List</h2>
                <div className="task-list">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-item ${selectedTask === task.id ? 'selected' : ''}`}
                      onClick={() => handleTaskItemClick(task.id)}
                    >
                      <h3>{task.taskName}</h3>
                      <p>DESCRIPTION: {task.description}</p>
                      <p>LOCATION: {task.location}</p>
                      <p> TIME FRAME: {task.timeFrame.hours} hours {task.timeFrame.minutes} minutes</p>
                      <p>POINTS: {task.points}</p>
                      {selectedTask === task.id && !isUpdateFormOpen && (
                        <div className="task-buttons">
                          <button onClick={() => handleDeleteTask(task.id)} className="delete-button1">Delete</button>
                          <button onClick={() => {
                            setUpdatingTaskId(task.id);
                            setIsUpdateFormOpen(true); // Set the update form open state
                          }} className="update-button1">Update</button>
                        </div>
                      )}
                      {updatingTaskId === task.id && isUpdateFormOpen && (
                        <div className="update-form" onClick={(e) => e.stopPropagation()}>
                          <div className="form-group">
                            <input
                              type="text"
                              id="updatedTaskName"
                              placeholder="Updated Task Name"
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
                            <div className="time-frame-inputs">
                              <input
                                type="number"
                                id="updatedHours"
                                min="0"
                                max="24"
                                value={updatedHours}
                                onChange={handleUpdatedHoursChange}
                                className="form-control time-input"
                              />
                              <span className="time-divider">:</span>
                              <input
                                type="number"
                                id="updatedMinutes"
                                min="0"
                                max="59"
                                value={updatedMinutes}
                                onChange={handleUpdatedMinutesChange}
                                className="form-control time-input"
                              />
                            </div>
                            {(updatedHours > 24 || (updatedHours === 24 && updatedMinutes > 0)) && (
                              <div className="error-message">Time frame should be within 24 hours.</div>
                            )}
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
                          <button onClick={() => {
                            setUpdatingTaskId(null);
                            setIsUpdateFormOpen(false); // Close the update form
                          }} className="btn btn-secondary">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* ... (floating add button) */}
            </>
          )}

          {selectedTab === 'ACCEPT' && (
            <div className="accept-container">
              <h2>Request Content</h2>
              {/* Add content specific to the "ACCEPT" tab */}
            </div>
          )}

          {selectedTab === 'COMPLETE' && (
            <div className="complete-container">
              <h2>Claim Content</h2>
              {/* Add content specific to the "COMPLETE" tab */}
            </div>
          )}
        </div>

        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
}

export default Task;
