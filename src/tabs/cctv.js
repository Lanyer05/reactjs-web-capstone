import React, { useEffect, useState } from 'react';
import AnimatedPage from '../AnimatedPage';
import { useNavigate } from 'react-router-dom';
import firebase from '../config/firebase';
import { toast } from 'react-toastify';
import "../css/Home.css";
import { firestore } from '../config/firebase';

const YOUTUBE_API_KEY = 'AIzaSyBRPSMC0ekzqQUgE8hcG5hKa3Fe9kHWsY0';
const CHANNEL_ID = 'UC3MVj4c1s5oZuvxlqm_OB7Q';

function Cctv() {
  const [liveStreamLinks, setLiveStreamLinks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        toast.error('Please login to access the tasks page.', {
          autoClose: 1500,
          hideProgressBar: true,
        });
        navigate('/login');
      }
    };

    checkLoggedInUser();
  }, [navigate]);

  useEffect(() => {
    const fetchLiveStreamLinks = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&eventType=live&type=video&part=snippet`
        );

        if (response.ok) {
          const data = await response.json();
          const liveStreamItems = data.items;

          const filteredLiveStreamItems = liveStreamItems.filter((item) => {
            return item.snippet.title === '1' || item.snippet.title === '2' || item.snippet.title === '3' || item.snippet.title === '4';
          });

          const slotToLiveStreamLinkMap = new Map();
          for (const item of filteredLiveStreamItems) {
            const videoId = item.id.videoId;
            const videoUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&controls=1&showinfo=0&autohide=1&iv_load_policy=3&autoplay=1`;
            const title = item.snippet.title;

            slotToLiveStreamLinkMap.set(title, {
              videoUrl,
              title,
            });
          }

         
          setLiveStreamLinks([...slotToLiveStreamLinkMap.values()]);
        } else {
          console.error('Error fetching live stream data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLiveStreamLinks();
  }, []);

  const containerStyle = {
    margin: '10px auto 10px',
    backgroundColor: 'lightgray',
  };

  const [revealedItems, setRevealedItems] = useState([false, false, false, false]);

  const handleItemClick = (index) => {
    setRevealedItems((prevState) => {
      const updatedItems = [...prevState];
      updatedItems[index] = !updatedItems[index];
      return updatedItems;
    });
  };

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const taskCollection = firestore.collection('user_acceptedTask');
        const querySnapshot = await taskCollection.get();
        const tasksData = [];
        querySnapshot.forEach((doc) => {
          const task = doc.data();
          tasksData.push(task);
        });
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const taskCollection = firestore.collection('user_acceptedTask');
    const unsubscribe = taskCollection.onSnapshot((querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        const task = doc.data();
        tasksData.push(task);
      });
      setTasks(tasksData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
          <h1 className="card-view">CCTV LIVE STREAM</h1>
          <div className="homepage-container">
          <div className="ui-list">
            {[1, 2, 3, 4].map((index) => (
              <div key={index}>
                <div className="ui-item2" onClick={() => handleItemClick(index)}>
                  <div className="circle">
                    <h1>{index}</h1>
                  </div>
                  {revealedItems[index] && (
                    <div>
                      {tasks
                        .filter((task) => task.camera === index.toString())
                        .map((task, i) => (
                          <div key={i} style={{ display: 'inline-block'}}>
                            <div className="task-container">
                              <h2 className="user-request-item">
                                <div className="content-container">
                                <div className="card-container">
                                  <div className="ongoing-indicator-container">
                                    <div className={`ongoing-indicator ${task.isStarted ? '' : 'not-started'}`}></div>
                                  </div>
                                </div>
                                  <div className="text-container">
                                    {task.taskName} | {task.acceptedByEmail}
                                  </div>
                                </div>
                              </h2>
                            </div>
                          </div>
                        ))
                        .reduce((rows, element, index) => {
                          if (index % 5 === 0) rows.push([]);
                          rows[rows.length - 1].push(element);
                          return rows;
                        }, [])
                        .map((row, rowIndex) => (
                          <div key={rowIndex}>
                            {row}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="video-wrapper" style={containerStyle}>
                  {liveStreamLinks.find((link) => link.title === `${index}`) ? (
                    <div>
                      <iframe
                        title={`Live Stream Camera ${index}`}
                        width="100%"
                        height="100%"
                        src={`${liveStreamLinks.find((link) => link.title === `${index}`).videoUrl}&autoplay=1`}
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                      <h2>{index}</h2>
                    </div>
                  ) : (
                    <h2>No live stream available | {index}</h2>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
}

export default React.memo(Cctv);
