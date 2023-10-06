import React, { useState, useEffect } from 'react';
import firebase from './config/firebase';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from './AnimatedPage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [taskChartData, setTaskChartData] = useState(null);
  const [userChartData, setUserChartData] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (!dataFetched) {
      const fetchData = async () => {
        try {
          const rewardsSnapshot = await firebase.firestore().collection('rewards').get();
          const completeRewardReqSnapshot = await firebase.firestore().collection('complete_rewardreq').get();
          const rewardRequestSnapshot = await firebase.firestore().collection('rewardrequest').get();

          const rewardsData = rewardsSnapshot.docs.map((doc) => doc.data());
          const completeRewardReqData = completeRewardReqSnapshot.docs.map((doc) => doc.data());
          const rewardRequestData = rewardRequestSnapshot.docs.map((doc) => doc.data());

          const chartData = [
            {
              name: 'Rewards',
              Rewards: rewardsData.length,
            },
            {
              name: 'Reward Requests',
              'Reward Requests': rewardRequestData.length,
            },
            {
              name: 'Complete Reward Requests',
              'Complete Reward Requests': completeRewardReqData.length,
            },
          ];

          setChartData(chartData);
          setDataFetched(true); // Mark data as fetched
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [dataFetched]);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const tasksSnapshot = await firebase.firestore().collection('tasks').get();
        const acceptedTasksSnapshot = await firebase.firestore().collection('user_acceptedTask').get();
        const completedTasksSnapshot = await firebase.firestore().collection('completed_task').get();
  
        const tasksData = tasksSnapshot.docs.map((doc) => doc.data());
        const acceptedTasksData = acceptedTasksSnapshot.docs.map((doc) => doc.data());
        const completedTasksData = completedTasksSnapshot.docs.map((doc) => doc.data());
  
        const confirmedTasks = completedTasksData.filter((task) => task.isConfirmed === true);
        const unconfirmedTasks = completedTasksData.filter((task) => task.isConfirmed === false);
  
        const taskChartData = [
          {
            name: 'Available Tasks',
            'Available Tasks': tasksData.length,
          },
          {
            name: 'Accepted Tasks',
            'Accepted Tasks': acceptedTasksData.length,
          },
          {
            name: 'To Review Tasks',
            'To Review Tasks': unconfirmedTasks.length,
          },
          {
            name: 'Confirmed Tasks',
            'Confirmed Tasks': confirmedTasks.length,
          },
        
        ];
  
        setTaskChartData(taskChartData);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
  
    if (!dataFetched) {
      fetchTaskData(); // Fetch task data only if dataFetched is false
    }
  }, [dataFetched]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersSnapshot = await firebase.firestore().collection('users').get();
        const registrationRequestsSnapshot = await firebase.firestore().collection('registration_requests').get();
  
        const usersData = usersSnapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.email.endsWith('@gmail.com'));

        const registrationRequestsData = registrationRequestsSnapshot.docs.map((doc) => doc.data());
  
        const userChartData = [
          {
            name: 'Registration Requests',
            'Registration Requests': registrationRequestsData.length,
          },
          {
            name: 'Users',
            Users: usersData.length,
          },
        ];
  
        setUserChartData(userChartData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    if (!dataFetched) {
      fetchUserData();
    }
  }, [dataFetched]);

  
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const fcmToken_admin = await firebase.messaging().getToken(); 
          const userRef = firebase.firestore().collection('users').doc(user.uid);
          const batch = firebase.firestore().batch();
          const userDoc = await userRef.get();
          if (userDoc.exists) {
            batch.update(userRef, {
              fcmToken_admin: fcmToken_admin, 
              email: user.email,
              uid: user.uid,
            });
          } else {
            batch.set(userRef, {
              fcmToken_admin: fcmToken_admin,
              email: user.email,
              uid: user.uid,
            });
          }
          await batch.commit();
        }
      } catch (error) {
        console.error('Error while retrieving or updating FCM token:', error);
      }
    };
    checkLoggedInUser();
  }, []);
  
  useEffect(() => {
    const requestPermission = () => {
      console.log('Requesting permission...');
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else if (permission === 'denied') {
          console.log('Notification permission denied.');
        } else {
          console.log('Notification permission dismissed.');
        }
      });
    };
    requestPermission();
  }, []);
  
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        setIsLoading(false);
      }
    };
    checkLoggedInUser();
  }, []);

  const [revealedItems, setRevealedItems] = useState({});
  const handleItemClick = (itemId) => {
    setRevealedItems((prevItems) => ({
      ...prevItems,
      [itemId]: !prevItems[itemId],
    }));
  };

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
          <h1 className="card-view">WELCOME TO HOMEPAGE</h1>
          <div className="homepage-container">
            {chartData && (
              <div className="ui-item" onClick={() => handleItemClick('item1')}>
                <h2>Explore Rewards Tab</h2>
                <button className="explore-button" onClick={() => navigate('/reward')}>
                  Explore
                </button>
              </div>
            )}
            {revealedItems['item1'] && (
              <div className="ui-revealed-content">
                <h2>Reward Chart</h2>
                <div className="chart-container" style={{ display: 'flex', justifyContent: 'center'}}>
                  <BarChart
                    width={700}
                    height={450}
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" domain={[0, 100]} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Rewards" fill="#8884d8" />
                    <Bar dataKey="Reward Requests" fill="#ffc658" />
                    <Bar dataKey="Complete Reward Requests" fill="#82ca9d" />
                  </BarChart>
                </div>
              </div>
            )}
    
            {taskChartData && (
              <div className="ui-item" onClick={() => handleItemClick('item2')}>
                <h2>Explore Task Tab</h2>
                <button className="explore-button" onClick={() => navigate('/task')}>
                  Explore
                </button>
              </div>
            )}
            {revealedItems['item2'] && (
              <div className="ui-revealed-content">
                <h2>Task Chart</h2>
                <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
                  <BarChart
                    width={700}
                    height={450}
                    data={taskChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" domain={[0, 100]} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Available Tasks" fill="#8884d8" />
                    <Bar dataKey="Accepted Tasks" fill="#ff6f61" />
                    <Bar dataKey="To Review Tasks" fill="#82ca9d" />
                    <Bar dataKey="Confirmed Tasks" fill="#ffc658" />        
                  </BarChart>
                </div>
              </div>
            )}
  
            {/* Add the "CCTV" tab */}
            {chartData && (
              <div className="ui-item" onClick={() => handleItemClick('item3')}>
                <h2>Explore CCTV Tab</h2>
                <button className="explore-button" onClick={() => navigate('/cctv')}>
                  Explore
                </button>
              </div>
            )}
  
            {revealedItems['item3'] && (
              <div className="ui-revealed-content">
                <h2>This section monitors the ongoing tasks</h2>
                {/* Include CCTV-related content here */}
              </div>
            )}
  
  {userChartData && (
  <div className="ui-item" onClick={() => handleItemClick('item5')}>
    <h2>Explore User Tab</h2>
    <button className="explore-button" onClick={() => navigate('/user')}>
      Explore
    </button>
  </div>
)}

{revealedItems['item5'] && (
  <div className="ui-revealed-content">
    <h2>User Chart</h2>
    <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
      <BarChart
        width={700}
        height={450}
        data={userChartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis type="number" domain={[0, 100]} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Users" fill="#8884d8" />
        <Bar dataKey="Registration Requests" fill="#ff6f61" />
      </BarChart>
    </div>
  </div>
)}
  
  
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default React.memo(Home);
