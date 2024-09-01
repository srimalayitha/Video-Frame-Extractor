import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [video, setVideo] = useState(null);
  const [numFrames, setNumFrames] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [userNumFrames, setUserNumFrames] = useState('');
  const videoPlayerRef = useRef(null);

  const handleFrameSliderChange = (event) => {
    const selectedFrame = parseInt(event.target.value);
    setCurrentFrame(selectedFrame);
    if (videoPlayerRef.current) {
      const videoDuration = videoPlayerRef.current.getDuration();
      const seekTime = (selectedFrame / numFrames) * videoDuration;
      videoPlayerRef.current.seekTo(seekTime);
    }
  };

  const handleUserNumFramesChange = (event) => {
    let userInput = parseInt(event.target.value);
    if (userInput <= 0 || isNaN(userInput)) {
      userInput = '';
    }
    setUserNumFrames(userInput.toString());
    setNumFrames(userInput);
    setCurrentFrame(0);
  };

  const saveFrameRange = () => {
    if (videoPlayerRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoPlayerRef.current.getInternalPlayer().videoWidth;
      canvas.height = videoPlayerRef.current.getInternalPlayer().videoHeight;
      const ctx = canvas.getContext('2d');

      const frameRate = videoPlayerRef.current.getDuration() / numFrames;
      const timeInSeconds = currentFrame * frameRate;

      if (Number.isFinite(timeInSeconds)) {
        videoPlayerRef.current.seekTo(timeInSeconds);
        ctx.drawImage(videoPlayerRef.current.getInternalPlayer(), 0, 0);

        const timestamp = Date.now();
        const fileName = `frame_${timestamp}_frame${currentFrame}.jpg`;
        const frameDataUri = canvas.toDataURL('image/jpeg');

        const a = document.createElement('a');
        a.href = frameDataUri;
        a.download = fileName;
        a.click();
        a.remove();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setVideo(URL.createObjectURL(acceptedFiles[0]));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.mp4, .asf, .avi',
  });

  return (
    <div className="container">
      <h1>Video Preview</h1>

      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <button className="upload-button">Upload Video</button>
      </div>

      <div className="video-container">
        <ReactPlayer
          ref={videoPlayerRef}
          url={video}
          controls={false}
          width="100%"
          height="100%"
          className="video"
          playing={false}
        />
      </div>

      <div>
        <div>
          <label>Number of Frames:</label>
          <input
            type="number"
            value={userNumFrames}
            onChange={handleUserNumFramesChange}
            style={{ width: '60px', marginLeft: '10px' }}
            min={1}
          />
        </div>
        <div>
          <label>Current Frame: {currentFrame}</label>
          <input
            type="range"
            min={1}
            max={numFrames}
            step={1}
            value={currentFrame}
            onChange={handleFrameSliderChange}
            style={{ width: '100%' }}
          />
        </div>
        <button onClick={saveFrameRange} className="button">
          Save Current Frame
        </button>
      </div>
    </div>
  );
}

export default App;
