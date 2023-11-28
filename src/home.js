import React, { useState, useEffect } from 'react';
import firebase from './config/firebase';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from './AnimatedPage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faClipboardList, faVideo, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import Logo from "./imgae-removebg.png";
import Logo1 from "./image2.png"
import Logo2 from "./Environment-bro.png"
import Logos from './5333978.jpg';

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
          const completeRewardReqSnapshot = await firebase.firestore().collection('coupons').get();
  
          const rewardsData = rewardsSnapshot.docs.map((doc) => doc.data());
          const completeRewardReqData = completeRewardReqSnapshot.docs.map((doc) => doc.data());
  
          const rewardRequestsCount = completeRewardReqData.filter((item) => item.isClaimed === false).length;
          const completeRewardRequestsCount = completeRewardReqData.filter((item) => item.isClaimed === true).length;
  
          const chartData = [
            {
              name: 'Rewards',
              Rewards: rewardsData.length,
            },
            {
              name: 'Coupons',
              Coupons: rewardRequestsCount,
            },
            {
              name: 'Claimed Coupons',
              Coupons : completeRewardRequestsCount,
            },
          ];
  
          setChartData(chartData);
          setDataFetched(true);
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
  
        const userData = usersSnapshot.docs
          .map((doc) => doc.data());
  
        const adminsData = userData.filter((user) => user.email.endsWith('@youradmin.com'));
        const usersData = userData.filter((user) => user.email.endsWith('@gmail.com'));
        const userChartData = [
          {
            name: 'Admins',
            Admins: adminsData.length,
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
          await user.getIdToken(true);
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
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error while retrieving or updating FCM token:', error);
      }
    };
    checkLoggedInUser();
  }, []);
  
 const checkLoggedInUser = async () => {
  try {
    const user = firebase.auth().currentUser;
    if (user) {
      console.log('User is logged in:', user.uid);
      await user.getIdToken(true);
      const fcmToken_admin = await firebase.messaging().getToken(); 
      const userRef = firebase.firestore().collection('users').doc(user.uid);
      const userDoc = await userRef.get(); 
      if (userDoc.exists && userDoc.data().fcmToken_admin !== fcmToken_admin) {
        const batch = firebase.firestore().batch();
        batch.update(userRef, {
          fcmToken_admin: fcmToken_admin, 
          email: user.email,
          uid: user.uid,
        });
        await batch.commit();
        console.log('FCM token updated:', fcmToken_admin);
      }
      
      setIsLoading(false);
    }
  } catch (error) {
    console.error('Error while retrieving or updating FCM token:', error);
  }
};
  
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };
    requestPermission();
  }, []);
  
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        checkLoggedInUser();
      }
    });
    return () => unsubscribe();
  }, []);

  const [revealedItems, setRevealedItems] = useState({});
  const handleItemClick = (itemId) => {
    setRevealedItems((prevItems) => ({
      ...prevItems,
      [itemId]: !prevItems[itemId],
    }));
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

  const deleteZeroQuantityRewards = async () => {
    try {
      const rewardsSnapshot = await firebase.firestore().collection('rewards').get();
  
      rewardsSnapshot.forEach(async (doc) => {
        const quantity = doc.data().quantity;
  
        if (quantity === 0) {
          await firebase.firestore().collection('rewards').doc(doc.id).delete();
          console.log(`Reward ${doc.id} with quantity 0 has been deleted.`);
        }
      });
    } catch (error) {
      console.error('Error deleting rewards with quantity 0:', error);
    }
  };
  

  useEffect(() => {
    deleteExpiredTasks();
    deleteZeroQuantityRewards();
  }, []);

  return (
    <AnimatedPage>
      <div className="home-container">
      <div className="content">
      <img src={Logos} alt="Welcome"style={{position: 'fixed',bottom: 0,left: 0,width: '100%',height: 'auto',objectFit: 'cover',zIndex: -1,opacity: 0.4,}}/>
      <img src={Logo}alt="Welcome"style={{position: 'fixed',bottom: 0,left: 50,width: '30%',height: 'auto',objectFit: 'cover',zIndex: -1,}}/>
      <img src={Logo1}alt="Welcome"style={{position: 'fixed',bottom:-50,right: 0,width: '30%',height: 'auto',objectFit: 'cover',zIndex: -1,}}/>
      <img src={Logo2}alt="Welcome"style={{position: 'fixed',bottom: -150,left: '50%',transform: 'translateX(-50%)',width: '35%',height: 'auto',objectFit: 'cover',zIndex: -1,}}/>
    <h1 className="card-view">WELCOME TO ECOTASKREWARD</h1>
     <div className="homepage-container">
      <div className="ui-list">
        {chartData && (
          <div className="ui-group">
            <div className="ui-item" onClick={() => handleItemClick('item1')}>
              <div className="circle">
                <FontAwesomeIcon icon={faGift} size="5x" />
              </div>
              <h2>REWARDS TAB</h2>
              <button className="explore-button" onClick={() => navigate('/reward')}>
                Explore
              </button>
            </div>

            {revealedItems['item1'] && (
              <div className="ui-revealed-content">
                <h2>Reward Chart</h2>
                <div className="chart-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    background={{ fill: 'white', padding: 5 }}
                    width={500}
                    height={300}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" domain={[0, 100]} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Rewards" fill="#8884d8" />
                    <Bar dataKey="Coupons" fill="#82ca9d" />
                    <Bar dataKey="Claimed Coupons" fill="#ffc658" />
                  </BarChart>
                </div>
              </div>
            )}
          </div>
        )}

        {taskChartData && (
          <div className="ui-group">
            <div className="ui-item" onClick={() => handleItemClick('item2')}>
              <div className="circle">
                <FontAwesomeIcon icon={faClipboardList} size="5x" />
              </div>
              <h2>TASK TAB</h2>
              <button className="explore-button" onClick={() => navigate('/task')}>
                Explore
              </button>
            </div>
            {revealedItems['item2'] && (
              <div className="ui-revealed-content">
                <h2>Task Chart</h2>
                <div className="chart-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                  <BarChart
                    width={500}
                    height={300}
                    data={taskChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    background={{ fill: 'white' }}
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
          </div>
        )}

        {chartData && (
          <div className="ui-group">
            <div className="ui-item" onClick={() => handleItemClick('item3')}>
              <div className="circle">
                <FontAwesomeIcon icon={faVideo} size="4x" />
              </div>
              <h2>CCTV TAB</h2>
              <button className="explore-button" onClick={() => navigate('/cctv')}>
                Explore
              </button>
            </div>
            {revealedItems['item3'] && (
              <div className="ui-revealed-content">
                <h2>This section monitors the ongoing tasks</h2>
              </div>
            )}
          </div>
        )}

        {userChartData && (
          <div className="ui-group">
            <div className="ui-item" onClick={() => handleItemClick('item5')}>
              <div className="circle">
                <FontAwesomeIcon icon={faUserAlt} size="5x" />
              </div>
              <h2>USERS TAB</h2>
              <button className="explore-button" onClick={() => navigate('/user')}>
                Explore
              </button>
            </div>
            {revealedItems['item5'] && (
              <div className="ui-revealed-content">
                <h2>User Chart</h2>
                <div className="chart-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                  <BarChart
                    width={500}
                    height={300}
                    data={userChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    background={{ fill: 'white' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" domain={[0, 100]} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Users" fill="#8884d8" />
                    <Bar dataKey="Admins" fill="#ff6f61" />
                  </BarChart>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
</div>
    </AnimatedPage>
  );
}

export default React.memo(Home);
