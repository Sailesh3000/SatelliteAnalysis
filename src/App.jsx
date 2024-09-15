// src/App.js
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from 'react-modal';
import './App.css'; 
import ReactPlayer from 'react-player';

Modal.setAppElement('#root');

function App() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length + selectedImages.length > 2) {
      alert('Please select exactly 2 images.');
      return;
    }

    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setSelectedImages(prevImages => [
      ...prevImages,
      ...newFiles
    ].slice(0, 2));
  };

  const openModal = () => {
    if (selectedImages.length === 2) {
      setModalIsOpen(true);
    } else {
      alert('Please select exactly 2 images.');
    }
  };

  const closeModal = () => setModalIsOpen(false);

  const handleCreateVideo = async () => {
    const formData = new FormData();
    formData.append("image1", selectedImages[0]);
    formData.append("image2", selectedImages[1]);

    try {
      const response = await fetch("http://localhost:5000/api/generate-video", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setVideoUrl(data.videoUrl);
      setModalIsOpen(false);
    } catch (error) {
      console.error("Error creating video", error);
    }
  };

  return (
    <div className="App">
      <h1>Image to Video Converter</h1>
      <div className="dropzone">
        <Dropzone onDrop={onDrop} accept="image/*" maxFiles={2} />
      </div>
      {selectedImages.length > 0 && (
        <div className="preview">
          {selectedImages.map((file, idx) => (
            <img key={idx} src={file.preview} alt={`Selected ${idx}`} className="preview-image" />
          ))}
        </div>
      )}
      <button onClick={handleCreateVideo}>Generate Video</button>


  <div className="video-output">
    <h2>Generated Video:</h2>
      <ReactPlayer url={videoUrl} controls />
    {/* <ReactPlayer url='https://www.youtube.com/watch?v=ysz5S6PUM-U' /> */}
  </div>
    </div>
  );
}

function Dropzone({ onDrop, accept, maxFiles }) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    multiple: true
  });

  return (
    <div {...getRootProps({ className: 'dropzone-box' })}>
      <input {...getInputProps()} />
      <p>Drag & drop 2 images here, or click to select images</p>
    </div>
  );
}

export default App;
