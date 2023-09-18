import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

class Cctv extends React.Component {
  componentDidMount() {
    // Create a Video.js player instance
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
      // Player is ready
    });
  }

  componentWillUnmount() {
    // Dispose of the Video.js player when the component unmounts
    if (this.player) {
      this.player.dispose();
    }
  }

  render() {
    return (
      <div data-vjs-player>
        <video
          ref={(node) => (this.videoNode = node)}
          className="video-js"
          controls
          width="640"
          height="480"
        >
          <source
            src="rtsp://admin:admin123@192.168.1.108:554/cam/realmonitor?channel=2&subtype=1"
            type="application/x-mpegURL"
          />
        </video>
      </div>
    );
  }
}

export default Cctv;
