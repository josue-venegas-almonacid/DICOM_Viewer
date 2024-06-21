// src/components/RTDoseViewer.js
import React, { useEffect, useRef, useState } from 'react';
import cornerstone from 'cornerstone-core';
import { initializeCornerstone } from '../CornerstoneSetup';

const RTDoseViewer = () => {
  const elementRef = useRef(null);
  const [imageIds, setImageIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    initializeCornerstone();

    const element = elementRef.current;
    cornerstone.enable(element);

    return () => {
      cornerstone.disable(element);
    };
  }, []);

  useEffect(() => {
    if (imageIds.length > 0) {
      loadAndDisplayImage(imageIds[currentIndex]);
    }
  }, [currentIndex, imageIds]);

  const loadAndDisplayImage = async (imageId) => {
    try {
      const image = await cornerstone.loadImage(imageId);
      cornerstone.displayImage(elementRef.current, image);
    } catch (error) {
      console.error('Error loading DICOM image:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const fileURL = URL.createObjectURL(file);

    try {
      const imageId = `wadouri:${fileURL}`;
      const image = await cornerstone.loadImage(imageId);
      const numberOfFrames = image.data.string('x00280008') || 1; // Number of frames
      const imageIds = [];

      for (let i = 0; i < numberOfFrames; i++) {
        imageIds.push(`${imageId}?frame=${i}`);
      }

      setImageIds(imageIds);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading DICOM file:', error);
    }
  };

  const handleSliderChange = (event) => {
    setCurrentIndex(Number(event.target.value));
  };

  return (
    <div>
      <div>
        <input type="file" onChange={handleFileUpload} />
      </div>

      <div
        ref={elementRef}
        style={{ width: '512px', height: '512px', background: 'black', margin: '10px' }}
      />

      {imageIds.length > 1 && (
        <input
          type="range"
          min="0"
          max={imageIds.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
        />
      )}
    </div>
  );
};

export default RTDoseViewer;
