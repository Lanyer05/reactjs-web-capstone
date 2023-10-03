import React, { useEffect, useState } from 'react';
import AnimatedPage from '../AnimatedPage';
import { useNavigate } from 'react-router-dom';
import firebase from '../config/firebase';
import { toast } from 'react-toastify';
import "../css/Home.css";

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
          const links = liveStreamItems.map((item) => {
            const videoId = item.id.videoId;
            return `https://www.youtube.com/embed/${videoId}?modestbranding=1&controls=1&showinfo=0&autohide=1&iv_load_policy=3`;
          });
          setLiveStreamLinks(links);
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
    margin: '30px',
  };

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content" >
          <h1 className="card-view">CCTV LIVE STREAM</h1>
          {liveStreamLinks.length > 0 ? (
            liveStreamLinks.map((link, index) => (
              <div className="video-wrapper" key={index} style={containerStyle}>
                <iframe
                  title={`Live Stream ${index + 1}`}
                  width="100%"
                  height="100%"
                  src={link}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            ))
          ) : (
            <p>No live streams available at the moment.</p>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

export default React.memo(Cctv);