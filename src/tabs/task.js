import React, { useState, useEffect, useRef } from 'react';
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import "../css/Home.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from '../config/firebase';
import AnimatedPage from '../AnimatedPage';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import Logos from '../5333978.jpg';

function Task() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
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
  const [userAcceptedTasks, setUserAcceptedTasks] = useState([]);
  const [selectedAcceptedItemId, setSelectedAcceptedItemId] = useState(null);
  const [showCancelButtonId, setShowCancelButtonId] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedCompletedItemId, setSelectedCompletedItemId] = useState(null);
  const [selectedSubTab, setSelectedSubTab] = useState('COMPLETED');
  const [confirmedTasks, setConfirmedTasks] = useState([]);
  const [selectedConfirmedItemId, setSelectedConfirmedItemId] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('1');
  const [updatedCameraSlot, setUpdatedCameraSlot] = useState('');
  const [maxUsers, setMaxUsers] = useState('');
  const [updatedMaxUsers, setUpdatedMaxUsers] = useState('');
  const [updatedExpirationDateTime, setUpdateExpirationDateTime] = useState('');
  const [expirationDateTime, setExpirationDateTime] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [points, setPoints] = useState(20);


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
        const filteredTasks = tasksData.filter(task => {
          return task.acceptedByUsers && task.acceptedByUsers.length < task.maxUsers;
        });
  
        setTasksList(filteredTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
  
    const unsubscribe = tasksCollectionRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const taskData = { id: change.doc.id, ...change.doc.data() };
        if (change.type === 'added') {
          if (taskData.acceptedByUsers && taskData.acceptedByUsers.length < taskData.maxUsers) {
          }
        }
      });
  
      fetchTasks();
    });
  
    return () => {
      unsubscribe();
    };
  }, []);
  

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
      if (
        !taskName ||
        !description ||
        !location ||
        !points ||
        !maxUsers ||
        !expirationDateTime ||
        (parseInt(hours) === 0 && parseInt(minutes) === 0)
      ) {
        setEmptyFieldWarning(true);
        toast.error('Please fill in all fields.', { autoClose: 1500, hideProgressBar: true });
        return;
      }
      try {
        const currentTimestamp = firebase.firestore.Timestamp.now();
        const expirationTimestamp = moment.tz(expirationDateTime, 'Asia/Manila').valueOf();
        const newTask = {
      taskId: uuidv4(),
      taskName: taskName,
      description: description,
      location: location,
      timeFrame: { hours: parseInt(hours), minutes: parseInt(minutes) },
      points: points,
      difficulty: difficulty,
      camera: selectedCamera,
      isAccepted: false,
      createdAt: currentTimestamp,
      maxUsers: parseInt(maxUsers),
      acceptedByUsers: [],
      expirationDateTime: firebase.firestore.Timestamp.fromMillis(expirationTimestamp),
      };
      const docRef = await firestore.collection('tasks').add(newTask);
      setTasksList([...tasksList, { id: docRef.id, ...newTask }]);
      
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
      const batch = firestore.batch();
      const taskRef = tasksCollectionRef.doc(taskId);
      batch.delete(taskRef);
      await batch.commit();
      const updatedTasksList = tasksList.filter((task) => task.id !== taskId);
      setTasksList(updatedTasksList);
      toast.success('Task deleted successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task.', { autoClose: 1500, hideProgressBar: true });
     }
   };


    const handleTaskItemClick = (taskId) => {
      setSelectedTaskId((prevId) => (prevId === taskId ? null : taskId));
      };
    const handleRevealDeleteButton = (id) => {
      setShowDeleteButtonId((prevId) => (prevId === id ? null : id));
      };


      const handleUpdateTask = async (taskId) => {
        try {
          const batch = firestore.batch();
          const taskRef = tasksCollectionRef.doc(taskId);
          const updates = {};
      
          if (updatedTaskName) {
            updates.taskName = updatedTaskName;
          }
          if (updatedDescription) {
            updates.description = updatedDescription;
          }
          if (updatedLocation) {
            updates.location = updatedLocation;
          }
          if (updatedPoints) {
            updates.points = parseInt(updatedPoints);
          }
          if (updatedHours || updatedMinutes) {
            updates.timeFrame = {
              hours: parseInt(updatedHours),
              minutes: parseInt(updatedMinutes),
            };
          }
          if (updatedCameraSlot) {
            updates.camera = {
              slot: updatedCameraSlot,
              number: selectedCamera.number,
            };
          }
          if (updatedMaxUsers) {
            updates.maxUsers = parseInt(updatedMaxUsers);
          }
          if (updatedExpirationDateTime) {
            const expirationTimestamp = moment.tz(updatedExpirationDateTime, 'Asia/Manila').valueOf();
            updates.expirationDateTime = firebase.firestore.Timestamp.fromMillis(expirationTimestamp);
          }    
          if (Object.keys(updates).length === 0) {
            toast.error('Please fill in the fields.', { autoClose: 1500, hideProgressBar: true });
            return;
          }
          batch.update(taskRef, updates);
          await batch.commit(); 
          const updatedTasksList = tasksList.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                ...updates,
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
        setMaxUsers('');
        setEmptyFieldWarning(false);
      };
      
      const tabStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        padding: '10px 40px',
        margin: '0 1px',
        marginBottom: '5px',
        color: 'white',
        backgroundColor: '#00A871',
        border: '1px solid rgb(7, 110, 50)',
        cursor: 'pointer',
        width: '170px',
        height: '40px',
        };
      const activeTabStyle = {
        ...tabStyle,
        backgroundColor: '#3f5159',
        };    


     useEffect(() => {
      const fetchUserAcceptedTasks = async () => {
        try {
          const acceptedTasksSnapshot = await firestore.collection('user_acceptedTask').get();
          const acceptedTasksData = acceptedTasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setUserAcceptedTasks(acceptedTasksData);
        } catch (error) {
          console.error('Error fetching user accepted tasks:', error);
        }
      };
      fetchUserAcceptedTasks();
      const unsubscribe = firestore.collection('user_acceptedTask').onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
          }
        });
      });
      return () => {
        unsubscribe();
      };
    }, []);

    
    const handleCancelTask = async (taskName) => {
      try {
        const batch = firestore.batch();
        const acceptedTaskRef = firestore.collection('user_acceptedTask').doc(taskName);
        batch.delete(acceptedTaskRef);
        await batch.commit();
        toast.success('Accepted Task Canceled!', {
          autoClose: 1500,
          hideProgressBar: true,
        });
      } catch (error) {
        console.error('Error canceling accepted task:', error);
        toast.error('Failed to cancel accepted task.', {
          autoClose: 1500,
          hideProgressBar: true,
        });
      }
    };
    

  const handleCompletedItemClick = (itemId) => {
    setSelectedCompletedItemId((prevId) => (prevId === itemId ? null : itemId));
  };
  

  useEffect(() => {
    const fetchCompletedTasks = () => {
      try {
        const completedTasksRef = firestore.collection('completed_task');
        const unsubscribe = completedTasksRef.onSnapshot((snapshot) => {
          const completedTasksData = snapshot.docs.map((doc) => {
            const completedTask = doc.data();
            const remainingTime = completedTask.remainingTime;
            return {
              id: doc.id,
              ...doc.data(),
              remainingTime: remainingTime,
            };
          });
          setCompletedTasks(completedTasksData);
        }, (error) => {
          console.error('Error fetching completed tasks:', error);
        });
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching completed tasks:', error);
      }
    };
    fetchCompletedTasks();
  }, []);


  const handleDeleteCompletedTask = async (taskId) => {
    try {
      const shouldDelete = window.confirm('Once denied, the user cannot resubmit the task');
      if (!shouldDelete) {
        return;
      }
      const batch = firestore.batch();
      const completedTaskRef = firestore.collection('completed_task').doc(taskId);
      batch.delete(completedTaskRef);
      await batch.commit();
      const updatedCompletedTasks = completedTasks.filter((completed) => completed.id !== taskId);
      setCompletedTasks(updatedCompletedTasks);
      toast.success('Completed task denied!', {
        autoClose: 1500,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error('Error deleting completed task:', error);
      toast.error('Failed to delete completed task.', {
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  };


  const handleAcceptItemClick = (itemId) => {
    setSelectedAcceptedItemId((prevId) => (prevId === itemId ? null : itemId));
  };
  const handleRevealCancelButton = (itemId) => {
    setShowCancelButtonId((prevId) => (prevId === itemId ? null : itemId));
  };


  useEffect(() => {
    const unsubscribeAccepted = firestore.collection('user_acceptedTask').onSnapshot(snapshot => {
      const acceptedTasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserAcceptedTasks(acceptedTasksData);
      });
    const unsubscribeCompleted = firestore.collection('completed_task').onSnapshot(snapshot => {
      const completedTasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompletedTasks(completedTasksData);
      });
    return () => {
      unsubscribeAccepted();
      unsubscribeCompleted();
      };
  }, []);


  const handleSubTabChange = (tab) => {
    setSelectedSubTab(tab);
  };
  
  const handleConfirmedItemClick = (itemId) => {
    setSelectedConfirmedItemId((prevId) => (prevId === itemId ? null : itemId));
  };
  
  const handleRevealConfirmButton = (itemId) => {
  };


  useEffect(() => {
    const fetchConfirmedTasks = () => {
      const unsubscribe = firestore.collection('completed_task')
        .where('isConfirmed', '==', true)
        .onSnapshot((querySnapshot) => {
          const confirmedTasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConfirmedTasks(confirmedTasksData);
        }, (error) => {
          console.error('Error fetching confirmed tasks:', error);
        });

      return () => unsubscribe();
    };

    fetchConfirmedTasks();
  }, []);

 const handleConfirmCompletedTask = async (taskId) => {
      try {
        const batch = firestore.batch();
        const completedTaskRef = firestore.collection('completed_task').doc(taskId);
        batch.update(completedTaskRef, {
          isConfirmed: true,
        });
        await batch.commit();
        const updatedCompletedTasks = completedTasks.map((completed) => {
          if (completed.id === taskId) {
            return {
              ...completed,
              isConfirmed: true,
            };
          }
          return completed;
        });
        setCompletedTasks(updatedCompletedTasks);
        await updatePointsFromCompletedTasks(taskId);
        toast.success('Task confirmed successfully!', {
          autoClose: 1500,
          hideProgressBar: true,
        });
      } catch (error) {
        console.error('Error confirming task:', error);
        toast.error('Failed to confirm task.', {
          autoClose: 1500,
          hideProgressBar: true,
        });
      }
    };

    
    const updatePointsFromCompletedTasks = async (taskId) => {
      try {
        const completedTaskDoc = await firestore.collection('completed_task').doc(taskId).get();
        const completedTaskData = completedTaskDoc.data();
        const userId = completedTaskData.acceptedBy;
        const userDoc = await firestore.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentPoints = userData.userpoints || 0;
          const taskPoints = parseInt(completedTaskData.points, 10);
          const remainingTime = completedTaskData.remainingTime;
          const [hours, minutes, seconds] = remainingTime.split(':').map(Number);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          const readableRemainingTime = new Date(totalSeconds * 1000).toISOString().substr(11, 8);
          let pointsToDeduct = 0;
          if (totalSeconds <= -3600) {
            pointsToDeduct = -10;
          } else if (totalSeconds <= -2400) {
            pointsToDeduct = -8;
          } else if (totalSeconds <= -1800) {
            pointsToDeduct = -6;
          } else if (totalSeconds <= -1200) {
            pointsToDeduct = -4;
          } else if (totalSeconds <= -600) {
            pointsToDeduct = -2;
          } else if (totalSeconds <= 0) {
            pointsToDeduct = -1;
          }
          pointsToDeduct = Math.min(pointsToDeduct, currentPoints);
          const updatedPoints = currentPoints + taskPoints + pointsToDeduct;
          await firestore.collection('users').doc(userId).update({
            userpoints: updatedPoints,
          });
          console.log('User points updated successfully.');
        }
      } catch (error) {
        console.error('Error updating user points:', error);
      }
    };    


    const deleteExpiredTasks = async () => {
      try {
        const tasksSnapshot = await firebase.firestore().collection('tasks').get();
        const currentTime = new Date();
  
        tasksSnapshot.forEach(async (doc) => {
          const expirationDateTime = doc.data().expirationDateTime.toDate(); 
  
          if (expirationDateTime < currentTime) {
            await firebase.firestore().collection('tasks').doc(doc.id).delete();
            console.log(`Task ${doc.id} has expired and has been deleted.`);
          }
        });
      } catch (error) {
        console.error('Error deleting expired tasks:', error);
      }
    };
  
    useEffect(() => {
      deleteExpiredTasks();
    }, []);


    const deleteUserExpiredTasks = async () => {
      try {
        const tasksSnapshot = await firebase.firestore().collection('user_acceptedTask').get();
        const currentTime = new Date();
    
        tasksSnapshot.forEach(async (doc) => {
          const expirationDateTime = doc.data().expirationDateTime.toDate();
          const isStarted = doc.data().isStarted || false;
    
          if (!isStarted && expirationDateTime < currentTime) {
            await firebase.firestore().collection('user_acceptedTask').doc(doc.id).delete();
            console.log(`Task ${doc.id} has expired and has been deleted.`);
          }
        });
      } catch (error) {
        console.error('Error deleting expired tasks:', error);
      }
    };
    
    useEffect(() => {
      deleteUserExpiredTasks();
    }, []);


    const handleDifficultyChange = (e) => {
      const selectedDifficulty = e.target.value;
      setDifficulty(selectedDifficulty);

      switch (selectedDifficulty) {
        case 'easy':
          setPoints(20);
          break;
        case 'moderate':
          setPoints(40);
          break;
        case 'hard':
          setPoints(60);
          break;
        case 'difficult':
          setPoints(80);
          break;
        case 'VeryDifficult':
          setPoints(100);
          break;
        default:
          setPoints(20);
      }
    };


  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
          <h1 className="card-view">TASK PAGE</h1>
          <img src={Logos} alt="Welcome"style={{position: 'fixed',bottom: 0,left: 0,width: '100%',height: 'auto',objectFit: 'cover',zIndex: -1,opacity: 0.4,}}/>
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
                  style={{ backgroundColor: 'white' }}
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
                  style={{ backgroundColor: 'white' }}
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
                  style={{ backgroundColor: 'white' }}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ marginRight: '40px' }}>
                <label htmlFor="maxUsers">Max Users:</label>
                <input
                  type="number"
                  id="maxUsers"
                  placeholder="Enter Max Users"
                  value={maxUsers}
                  onChange={(e) => {const inputValue = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10));
                  setMaxUsers(inputValue);}}
                  className="form-control"
                  min="0"
                  style={{ backgroundColor: 'white' }}
                />
              </div>
              <div style={{ marginLeft: '40px' }}>
              <label htmlFor="expirationDateTime">Expiration Date and Time:</label>
              <input
                type="datetime-local"
                id="expirationDateTime"
                value={expirationDateTime}
                onChange={(e) => setExpirationDateTime(e.target.value)}
                className="form-control"
                style={{ backgroundColor: 'white' }}
              />
            </div>
            </div>
              <div className="form-group" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ marginRight: '40px' }}>
                    <label htmlFor="hours">Time Frame (Hours):</label>
                    <input
                      type="number"
                      id="hours"
                      placeholder='Enter Hours'
                      value={hours}
                      onChange={(e) => setHours(e.target.value === '' ? '' : Math.max(0, Math.min(23, parseInt(e.target.value, 10))))}
                      className="form-control"
                      min="0"
                      max="23"
                      style={{ backgroundColor: 'white' }}
                    />
                  </div>

                  <div style={{ marginLeft: '40px' }}>
                    <label htmlFor="minutes">Time Frame (Minutes):</label>
                    <input
                      type="number"
                      id="minutes"
                      placeholder='Enter Minutes'
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value === '' ? '' : Math.max(0, Math.min(59, parseInt(e.target.value, 10))))}
                      className="form-control"
                      min="0"
                      max="59"
                      style={{ backgroundColor: 'white' }}
                    />
                  </div>
                </div>
              <div className="form-group">
                <label htmlFor="camera">Camera:</label>
                <select
                  type=""
                  id="camera"
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="form-control"
                >
                  <option value="1">Camera 1</option>
                  <option value="2">Camera 2</option>
                  <option value="3">Camera 3</option>
                  <option value="4">Camera 4</option>
                </select>
              </div>
               <div className="form-group">
                <label htmlFor="difficulty">Task Difficulty:</label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  className="form-control"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                  <option value="difficult">Difficult</option>
                  <option value="VeryDifficult">Very Difficult</option>
                </select>
                <label htmlFor="points">Points:</label>
                <input
                  placeholder="Points"
                  type="number"
                  id="points"
                  value={points}
                  onChange={(e) => {
                    const inputValue = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10));
                    setPoints(inputValue);
                  }}
                  className="form-control"
                  min="0"
                  style={{ backgroundColor: 'white' }}
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
                style={selectedTab === 'ACCEPT' ? activeTabStyle : tabStyle}
                onClick={() => handleTabChange('ACCEPT')}
              >
                Accept
              </button>
              <button
                style={selectedTab === 'COMPLETE' ? activeTabStyle : tabStyle}
                onClick={() => handleTabChange('COMPLETE')}
              >
                Complete
              </button>
            </div>


          {selectedTab === 'TASK' && (
    <>
    <div className="tasks-container">
      <h2>Tasks List</h2>
      <div className="tasks-list">
      {tasksList
          .slice()
          .sort((a, b) => {
            const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
            const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
            return bTime - aTime;
          })
          .map((task, index) => (
          <div
            key={index}
            className={`task-item ${selectedTaskId === task.id ? 'selected' : ''}`}
            onClick={() => handleTaskItemClick(task.id)}
            onMouseEnter={() => handleRevealDeleteButton(task.id)}
            onMouseLeave={() => handleRevealDeleteButton(null)}>
                <div className="task-details">
                  <h3>{task.taskName}</h3>
                  <div className="divider"></div>
                  <p>
                    <span className="label">Description:</span>
                    {task.description}
                  </p>
                  <div className="divider"></div>
                  <p>
                    <span className="label">Location:</span>
                    {task.location}
                  </p>
                  <div className="divider"></div>
                  <p>
                    <span className="label">Time Frame:</span>
                    {task.timeFrame?.hours || 0} hours {task.timeFrame?.minutes || 0} minutes
                  </p>
                  <div className="divider"></div>
                    {task.expirationDateTime && (
                      <p>
                        <span className="label">Task Expiration:</span> 
                        {new Date(task.expirationDateTime.toMillis()).toLocaleString()}
                      </p>
                      )}
                  <div className="divider"></div>
                  <p>
                    <span className="label">Points:</span>
                    {task.points}
                  </p>
                  <div className="divider"></div>
                  {task.camera && (
                    <p>
                      <span className="label">Camera:</span>
                      {task.camera}
                    </p>
                  )}
                  <div className="divider"></div>
                  <p>
                    <span className="label">Max Users:</span> 
                    {task.acceptedByUsers.length}/{task.maxUsers || 'Not specified'}
                  </p>
                  <div className="divider"></div>
                  <p>
                    <span className="label">Task ID:</span> 
                    {task.taskId || 'Not specified'}
                  </p>
                  <div className="divider"></div>
                </div>

                      {selectedTaskId === task.id && (
                        <>
                          <button
                            onClick={() => setUpdatingTaskId(task.id)}
                            className={`confirm-button ${showDeleteButtonId === task.id ? 'visible' : ''}`}>
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className={`delete-button ${showDeleteButtonId === task.id ? 'visible' : ''}`}>
                            Delete
                          </button>
                        </>
                      )}
                      {updatingTaskId === task.id && (
                        <div className="update-form" onClick={(e) => e.stopPropagation()}>
                        <div className="form-group">
                          <input
                            type="text"
                            id="updatedTaskName"
                            placeholder="Update Task Name"
                            value={updatedTaskName}
                            onChange={(e) => setUpdatedTaskName(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            id="updatedDescription"
                            placeholder="Update Description"
                            value={updatedDescription}
                            onChange={(e) => setUpdatedDescription(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            id="updatedLocation"
                            placeholder="Update Location"
                            value={updatedLocation}
                            onChange={(e) => setUpdatedLocation(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="number"
                            id="updatedHours"
                            placeholder="Hours"
                            value={updatedHours === 0 ? '' : updatedHours}
                            onChange={(e) => setUpdatedHours(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="number"
                            id="updatedMinutes"
                            placeholder="Minutes"
                            value={updatedMinutes === 0 ? '' : updatedMinutes}
                            onChange={(e) => setUpdatedMinutes(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="datetime-local"
                            id="expirationDateTime"
                            value={updatedExpirationDateTime}
                            onChange={(e) => setUpdateExpirationDateTime(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="number"
                            id="updatedPoints"
                            placeholder="Points"
                            value={updatedPoints}
                            onChange={(e) => setUpdatedPoints(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="number"
                            id="updatedCameraSlot"
                            placeholder="Update Camera Slot"
                            value={updatedCameraSlot}
                            onChange={(e) => {
                              const enteredValue = e.target.value;
                              const filteredValue = enteredValue.replace(/[^1-4]/g, ''); 
                              const newValue = filteredValue.length > 0 ? parseInt(filteredValue, 10) : '';
                              setUpdatedCameraSlot(newValue);
                            }}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="number"
                            id="updatedMaxUsers"
                            placeholder="Max Users"
                            value={updatedMaxUsers}
                            onChange={(e) => setUpdatedMaxUsers(e.target.value)}
                            className="form-control"
                          />
                        </div>
                          <button onClick={() => handleUpdateTask(task.id)} className="confirm-button">
                            Update
                          </button>
                          <button onClick={() => setUpdatingTaskId(null)} className="delete-button">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {tasksList.length === 0 && <p>No tasks found.</p>} 
                </div>
              </div>
              <div className="floating-button-container">
                  {showAddForm ? (
                    <button onClick={() => setShowAddForm(false)} className="floating-add-button">
                      <span style={{ fontSize: '24px' }}>-</span>
                    </button>
                    ) : (
                    <div className="button-container">
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="floating-add-button"
                      >
                        <span style={{ fontSize: '24px' }}>+</span>
                      </button>
                      <div className="indicator-animation">Add Task</div>
                    </div>
                  )}
                </div>
            </>
          )}

    {selectedTab === 'ACCEPT' && (
        <div className="accept-container">
        <h2>Accept List</h2>
        <div className="accept-list">
        {userAcceptedTasks.slice().reverse().map((accepted) => (
        <div
          key={accepted.id}
          className={`accept-item ${selectedAcceptedItemId === accepted.id ? 'selected' : ''}`}
          onClick={() => handleAcceptItemClick(accepted.id)}
          onMouseEnter={() => handleRevealCancelButton(accepted.id)}
          onMouseLeave={() => handleRevealCancelButton(null)}
         >
             <div className="cards-container">
                <div className="ongoing-indicator-container">
                  <div className={`ongoing-indicator ${accepted.isStarted ? '' : 'not-started'}`}></div>
                </div>
              </div>
          <div className="accepted-details">
            <h3>{accepted.taskName}</h3>
            <div className="divider"></div>
            <p>
              <span className="label">Description:</span>
              {accepted.description}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">Location:</span>
              {accepted.location}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">Time Frame:</span>
              {accepted.timeFrame
                ? `${accepted.timeFrame.hours} hours ${accepted.timeFrame.minutes} minutes`: 'N/A'}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">Points:</span>
              {accepted.points}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">User ID:</span>
              {accepted.acceptedBy}
            </p>
            <div className="divider"></div>
            <p>
              <span className='label'>Max User:</span>
              {`${accepted.maxUsers}`}
            </p>
            <div className="divider"></div>
          <p>
            <span className='label'>Accepted By:</span> 
            {accepted.acceptedByEmail}
          </p>
            <div className="divider"></div>
              {accepted.camera && (
                <p>
                  <span className="label">Camera:</span>
                  {accepted.camera}
                </p>
              )}
            <div className="divider"></div>
            <p>
              <span className="label">Time Accepted:</span>
              <span className="blue-highlight">{accepted.acceptedDateTime}</span>
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">Task ID:</span>
              {accepted.taskId}
            </p>
            </div>
            {selectedAcceptedItemId === accepted.id && !accepted.isStarted && (
              <button
                  onClick={() => handleCancelTask(accepted.id)}
                  className={`delete-button ${showCancelButtonId === accepted.id ? 'visible' : ''}`}>
                  Cancel
              </button>)}
              </div>))}
                {userAcceptedTasks.length === 0 && <p>No Accepted tasks found.</p>}
          </div>
      </div>
    )}

{selectedTab === 'COMPLETE' && (
  <div className="complete-container">
    <h2>Complete List</h2>
    <div className="tab-buttons">
      <button
        className={`tab-button ${selectedSubTab === 'COMPLETED' ? 'active' : ''}`}
        onClick={() => handleSubTabChange('COMPLETED')}>
        Completed
      </button>
      <button
        className={`tab-button ${selectedSubTab === 'CONFIRMED' ? 'active' : ''}`}
        onClick={() => handleSubTabChange('CONFIRMED')}>
        Confirmed
      </button>
    </div>
    <div className="completed-list">
      {selectedSubTab === 'COMPLETED' && (
        <>
          {completedTasks
            .filter((completed) => !completed.isConfirmed).slice().reverse().map((completed) => (
              <div
                key={completed.id}
                className={`completed-item ${selectedCompletedItemId === completed.id ? 'selected' : ''}`}
                onClick={() => handleCompletedItemClick(completed.id)}
                onMouseEnter={() => handleRevealDeleteButton(completed.id)}
                onMouseLeave={() => handleRevealDeleteButton(null)}>
                <div className="completed-details">
                    <h3>{completed.taskName}</h3>
                    <div className="divider"></div>
                    <p>
                      <span className="label">Description:</span>
                      {completed.description}
                    </p>
                    <div className="divider"></div>
                    <p>
                      <span className="label">Time Frame:</span>
                      {completed.timeFrame ? `${completed.timeFrame.hours.toString().padStart(2, '0')}:${completed.timeFrame.minutes.toString().padStart(2, '0')}:00` : 'N/A'}
                    </p>
                    <div className="divider"></div>
                    <p>
                      <span className="label">Time Completed:</span>
                      {completed.remainingTime}
                    </p>
                    <div className="divider"></div>
                    <p>
                      <span className="label">Points:</span>
                      {completed.points}
                    </p>
                    <div className="divider"></div>
                    <p>
                      <span className="label">User ID:</span>
                      {completed.acceptedBy}
                    </p>
                    <div className="divider"></div>
                    <p>
                      <span className="label">User Email:</span>
                      {completed.acceptedByEmail}
                    </p>
                    <div className="divider"></div>
                    <p>
                      <span className="label">Accepted Time:</span>
                      <span className="blue-highlight">{completed.acceptedDateTime}</span>
                    </p>
                     <div className="divider"></div>
                    <p>
                      <span className="label">Completed Time:</span>
                      <span className="red-highlight">{completed.completedDateTime}</span>
                    </p>
                    <div className="divider"></div>
                    <p>
                      <span className="label">Task ID:</span>
                      {completed.taskId}
                    </p>
                  </div>

                {selectedCompletedItemId === completed.id && (
                  <div className={`completed-item-actions ${showDeleteButtonId === completed.id ? 'visible' : ''}`}>
                    <div className="centered-image">
                      {completed.imageUrl && (
                        <img
                          src={completed.imageUrl}
                          alt="Completed Task"
                          className="responsive-image"/>
                        )}
                    </div>
                    <button onClick={() => handleConfirmCompletedTask(completed.id)} className="confirm-button">
                      Confirm
                    </button>
                    <button onClick={() => handleDeleteCompletedTask(completed.id)} className="delete-button">
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))}
          {completedTasks.filter((completed) => !completed.isConfirmed).length === 0 && (
            <p>No completed tasks found.</p>
          )}
        </>
      )}
      </div>
      {selectedSubTab === 'CONFIRMED' && (
  <div className="confirmed-list">
    {confirmedTasks
        .filter((confirmed) => confirmed.isConfirmed).slice().reverse().map((confirmed) => (
        <div
          key={confirmed.id}
          className={`confirmed-item ${selectedConfirmedItemId === confirmed.id ? 'selected' : ''}`}
          onClick={() => handleConfirmedItemClick(confirmed.id)}
          onMouseEnter={() => handleRevealConfirmButton(confirmed.id)}
          onMouseLeave={() => handleRevealConfirmButton(null)}>
          <div className="confirmed-details">
            <h3>{confirmed.taskName}</h3>
            <div className="divider"></div>
            <p>
              <span className="label">Description:</span>
              {confirmed.description}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">Time Frame:</span>
              {confirmed.timeFrame
                ? `${confirmed.timeFrame.hours.toString().padStart(2, '0')}:${confirmed.timeFrame.minutes.toString().padStart(2, '0')}:00`
                : 'N/A'}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">Points:</span>
              {confirmed.points}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">User ID:</span>
              {confirmed.acceptedBy}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">User Email:</span>
              {confirmed.acceptedByEmail}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">End Time:</span>
              {confirmed.remainingTime}
            </p>
            <div className="divider"></div>
            <p>
              <span className="label">Accepted Time:</span>
              <span className="blue-highlight">{confirmed.acceptedDateTime}</span>
            </p>
            <div className="divider"></div>
            <p>
            <span className="label">Completed Time:</span>
            <span className="red-highlight">{confirmed.completedDateTime}</span>
            </p>
            <div className="divider"></div>
            <p>
            <span className="label">Task ID:</span>
            <span className="green-highlight">{confirmed.taskId} || VERIFIED </span>
            </p>
          </div>
          {selectedConfirmedItemId === confirmed.id && (
            <div className={`confirmed-item-actions ${showDeleteButtonId === confirmed.id ? 'visible' : ''}`}>
              <div className="centered-image">
                {confirmed.imageUrl && (
                  <img
                    src={confirmed.imageUrl}
                    alt="Confirmed Task"
                    className="responsive-image"/>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    {confirmedTasks.filter((confirmed) => confirmed.isConfirmed).length === 0 && (
      <p>No confirmed tasks found.</p>
      )}
      </div>
      )}
    </div>
      )}
       </div>
        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
}
export default React.memo(Task);