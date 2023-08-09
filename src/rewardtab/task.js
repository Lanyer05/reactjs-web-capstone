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
  const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [points, setPoints] = useState('');
  const [tasksList, setTasksList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const tasksCollectionRef = firestore.collection("tasks");
  const formContainerRef = useRef(null);
  const [updatedTaskName, setUpdatedTaskName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedLocation, setUpdatedLocation] = useState('');
  const [updatedHours, setUpdatedHours] = useState(0);
  const [updatedMinutes, setUpdatedMinutes] = useState(0);
  const [updatedPoints, setUpdatedPoints] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('TASK');
  
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  

   useEffect(() => {
    const handleClickOutsideForm = (event) => {
      if (formContainerRef.current && !formContainerRef.current.contains(event.target)) {
        if (showAddForm) {
          setShowAddForm(false);
          resetForm();
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
  }, [showAddForm, showUpdateForm]);

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
        toast.error('Please login to access the rewards page.', { autoClose: 1500, hideProgressBar: true });
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
        taskName:taskName,
        description:description,
        location:location,
        timeFrame: { hours, minutes },
        points: points,
      };
      await tasksCollectionRef.add(newTask);
      setTasksList([...tasksList, newTask]);
      setTaskName("");
      setDescription("");
      setLocation("");
      setPoints("");
      resetForm();
      toast.success('Task added successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksCollectionRef.doc(taskId).delete();
      const updateTasksList = tasksList.filter((task) => task.id !== taskId);
      setTasksList(updateTasksList);
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

  const handleUpdateTask = async (taskId) => {
    if (!updatedTaskName || !updatedDescription || !updatedLocation || !updatedPoints) {
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

      const updateTasksList = tasksList.map((task) => {
        if (task.id === taskId) {
          return{
            ...task,
            taskName: updatedTaskName,
            description: updatedDescription,
            location: updatedLocation,
            timeFrame: { hours: updatedHours, minutes: updatedMinutes },
            points: updatedPoints,
          }
        }
        return task;
      })
      setTasksList(updateTasksList);
      setSelectedTask(taskId);
      setUpdatingTaskId(null);
      toast.success('Task updated successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task.', { autoClose: 1500, hideProgressBar: true });
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

  return (
    <AnimatedPage>
      <div className="home-container">
        <Sidebar isOpen={isOpen} handleTrigger={handleTrigger} navigate={navigate} handleLogout={handleLogout} />

        <div className="content">
          <h1 className="card-view">TASK PAGE</h1>

          <div className={`floating-form ${showAddForm ? 'visible' : ''}`} ref={formContainerRef}>
            <div className="form-container">
              <div className="form-group">
                <label htmlFor="taskName">Task Name:</label>
                <input
                  placeholder="Enter Task Name"
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
                <label htmlFor="timeInput">Time Frame:</label>
                <div className="time-frame-inputs">
                  <input
                    type="number"
                    id="hours"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={handleHoursChange}
                    className="form-control time-input"
                  />
                  <span className="time-divider">:</span>
                  <input
                    type="number"
                    id="minutes"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={handleMinutesChange}
                    className="form-control time-input"
                  />
                </div>
                {(hours > 24 || (hours === 24 && minutes > 0)) && (
                  <div className="error-message">Time frame should be within 24 hours.</div>
                )}
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
                Create Task
              </button>
              <button onClick={() => { setShowAddForm(false); resetForm(); }} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
          <div className="tabs">
          <button
              style={selectedTab === "TASK" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("TASK")}
            >
              Reward
            </button>
            <button
              style={selectedTab === "ACCEPT" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("ACCEPT")}
            >
              Request
            </button>
            <button
              style={selectedTab === "COMPLETE" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("COMPLETE")}
            >
              Claim
            </button>
          </div>

          {selectedTab === 'TASK' && (
            <>
              <div className="task-container">
                <h2>Task List</h2>
                <div className="task-list">
                  {tasksList.map((task) => (
                    <div
                      key={task.id}
                      className={`task-item ${selectedTask === task.id ? 'selected' : ''}`}
                      onClick={() => handleTaskItemClick(task.id)}
                      
                    >
                      <h3>{task.taskName}</h3>
                      <p>DESCRIPTION: {task.description}</p>
                      <p>LOCATION: {task.location}</p>
                      <p>TIME FRAME: {task.timeFrame.hours} hours {task.timeFrame.minutes} minutes</p>
                      <p>POINTS: {task.points}</p>
                      {selectedTask === task.id && !isUpdateFormOpen && (

                        <>
                          <button onClick={() => handleDeleteTask(task.id)} className="delete-button1">Delete</button>
                          <button onClick={() =>handleUpdateTask (task.id)} className="update-button1">Update</button>
                        </>
                      )}
                      {updatingTaskId === task.id && (
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