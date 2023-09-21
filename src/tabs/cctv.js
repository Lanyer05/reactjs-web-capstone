import React, { useEffect, useState } from 'react';
import AnimatedPage from '../AnimatedPage';
import { useNavigate } from 'react-router-dom';
import firebase from '../config/firebase';
import { toast } from 'react-toastify';
import "../css/Home.css";

const API_KEY = 'AIzaSyBRPSMC0ekzqQUgE8hcG5hKa3Fe9kHWsY0';
const CHANNEL_ID = 'UC3MVj4c1s5oZuvxlqm_OB7Q';

function CctvComponent() {
  const [liveStreams, setLiveStreams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if cached state exists in localStorage and use it if available
    const cachedState = localStorage.getItem('cctvState');
    if (cachedState) {
      setLiveStreams(JSON.parse(cachedState));
    } else {
      // Fetch live streams if no cached state is available
      const fetchLiveStreams = async () => {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&eventType=live&type=video&part=snippet`
          );

          if (response.ok) {
            const data = await response.json();
            const liveStreamData = data.items;
            setLiveStreams(liveStreamData);

            // Cache the state in localStorage
            localStorage.setItem('cctvState', JSON.stringify(liveStreamData));
          } else {
            console.error('Error fetching live streams data');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      fetchLiveStreams();
    }
  }, []);

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

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
          <h1 className="card-view">CCTV LIVE STREAMS</h1>
          {liveStreams.length === 0 ? (
            <p>No live streams available at the moment.</p>
          ) : (
            <ul className="video-list">
              {liveStreams.map((stream) => (
                <li key={stream.id.videoId} className="video-item">
                  <div className="video-wrapper">
                    <iframe
                      title={stream.snippet.title}
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${stream.id.videoId}?modestbranding=1&controls=1&showinfo=0&autohide=1&iv_load_policy=3`}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

export default React.memo(CctvComponent);
