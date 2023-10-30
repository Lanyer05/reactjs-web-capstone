import React, { useEffect, useState } from 'react';
import AnimatedPage from '../AnimatedPage';
import { useNavigate } from 'react-router-dom';
import firebase from '../config/firebase';
import { toast } from 'react-toastify';
import "../css/Home.css";
import { firestore } from '../config/firebase'; // Import your Firebase Firestore instance here

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
        // Get all live streams from the YouTube channel
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&eventType=live&type=video&part=snippet`
        );

        if (response.ok) {
          const data = await response.json();
          const liveStreamItems = data.items;

          // Filter the live streams to only include those with the titles "1", "2", "3", or "4"
          const filteredLiveStreamItems = liveStreamItems.filter((item) => {
            return item.snippet.title === '1' || item.snippet.title === '2' || item.snippet.title === '3' || item.snippet.title === '4';
          });

          // Create a map of live stream links, grouped by slot number
          const slotToLiveStreamLinkMap = new Map();
          for (const item of filteredLiveStreamItems) {
            const videoId = item.id.videoId;
            const videoUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&controls=1&showinfo=0&autohide=1&iv_load_policy=3`;
            const title = item.snippet.title;

            slotToLiveStreamLinkMap.set(title, {
              videoUrl,
              title,
            });
          }

          // Set the live stream links state
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
    margin: '10px auto 40px',
    backgroundColor: 'lightgray',
  };

  const [revealedItem, setRevealedItem] = useState(null);

  const handleItemClick = (itemId) => {
    setRevealedItem(itemId === revealedItem ? null : itemId);
  };

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch tasks from Firestore and update the state
    const fetchTasks = async () => {
      try {
        const taskCollection = firestore.collection('tasks'); // Assuming 'tasks' is the collection name
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

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
          <h1 className="card-view">CCTV LIVE STREAM</h1>
          <div className="homepage-container">
            {[1, 2, 3, 4].map((index) => (
              <div key={index}>
                <div className="ui-item" onClick={() => handleItemClick(`item${index}`)}>
                  <div className="circle">
                    <h1>{index}</h1>
                  </div>
                  {revealedItem === `item${index}` && (
                    <h2>{tasks.find((task) => task.camera === index.toString())?.taskName || ''}</h2>
                  )}
                </div>
                <div className="video-wrapper" style={containerStyle}>
                  {liveStreamLinks.find((link) => link.title === `${index}`) ? (
                    <div>
                      <iframe
                        title={`Live Stream Camera ${index}`}
                        width="100%"
                        height="100%"
                        src={liveStreamLinks.find((link) => link.title === `${index}`).videoUrl}
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
    </AnimatedPage>
  );
}

export default React.memo(Cctv);
