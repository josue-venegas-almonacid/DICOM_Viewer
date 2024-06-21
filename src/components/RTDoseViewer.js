// src/components/RTDoseViewer.js
import React, { useEffect, useRef, useState } from 'react';
import cornerstone from 'cornerstone-core';
import { initializeCornerstone } from '../CornerstoneSetup';

const RTDoseViewer = () => {
  const elementRef = useRef(null);
  const [imageIds, setImageIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enabledColors, setEnabledColors] = useState({
    '255,0,255': true, // Magenta
    '0,0,255': true,   // Blue
    '0,255,255': true, // Cyan
    '0,255,0': true,   // Green
    '255,255,0': true, // Yellow
    '255,0,0': true    // Red
  });

  useEffect(() => {
    initializeCornerstone();

    const element = elementRef.current;
    cornerstone.enable(element);

    return () => {
      cornerstone.disable(element);
    };
  }, []);

  useEffect(() => {
    const applyColorMap = (image) => {
      const colorMap = (pixelValue) => {
        const colors = [
          { threshold: 0, color: [0, 0, 0] },       // Black for background
          { threshold: 0.1, color: [255, 0, 255] }, // Magenta
          { threshold: 0.3, color: [0, 0, 255] },   // Blue
          { threshold: 0.5, color: [0, 255, 255] }, // Cyan
          { threshold: 0.6, color: [0, 255, 0] },   // Green
          { threshold: 0.7, color: [255, 255, 0] }, // Yellow
          { threshold: 0.9, color: [255, 0, 0] }    // Red
        ];
  
        for (let i = colors.length - 1; i >= 0; i--) {
          if (pixelValue >= colors[i].threshold) {
            return colors[i].color;
          }
        }
        return [0, 0, 0]; // Default to black if no match
      };
  
      const pixelData = image.getPixelData();
      const rgbaLut = new Uint8ClampedArray(pixelData.length * 4);
      const maxDose = Math.max(...pixelData);
  
      for (let i = 0; i < pixelData.length; i++) {
        const value = pixelData[i] / maxDose;
        let [r, g, b] = colorMap(value);
  
        const colorKey = `${r},${g},${b}`;
        if (!enabledColors[colorKey]) {
          const grayscale = 0.3 * r + 0.59 * g + 0.11 * b;
          r = g = b = grayscale;
        }
  
        rgbaLut[i * 4] = r;
        rgbaLut[i * 4 + 1] = g;
        rgbaLut[i * 4 + 2] = b;
        rgbaLut[i * 4 + 3] = 255; // Alpha
      }
  
      image.color = true;
      image.getPixelData = () => rgbaLut;
      image.getCanvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(image.width, image.height);
        imageData.data.set(rgbaLut);
        context.putImageData(imageData, 0, 0);
        return canvas;
      };
    };

    const loadAndDisplayImage = async (imageId) => {
      try {
        const image = await cornerstone.loadImage(imageId);
        applyColorMap(image);
        cornerstone.displayImage(elementRef.current, image);
      } catch (error) {
        console.error('Error loading DICOM image:', error);
      }
    };

    if (imageIds.length > 0) {
      loadAndDisplayImage(imageIds[currentIndex]);
    }
  }, [currentIndex, imageIds, enabledColors]);

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

  const handleColorCheckboxChange = (colorKey) => {
    setEnabledColors((prev) => ({
      ...prev,
      [colorKey]: !prev[colorKey]
    }));
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />

      <div style={{ display: 'flex' }}>
        <div ref={elementRef} style={{ width: '512px', height: '512px', margin: '10px' }} />

        <div style={{ margin: '10px' }}>
          {imageIds.length > 1 && (
            <input
              type="range"
              min="0"
              max={imageIds.length - 1}
              value={currentIndex}
              onChange={handleSliderChange}
            />
          )}

          {imageIds.length > 0 && (
            <div>
              {Object.keys(enabledColors).map((colorKey) => (
                <div key={colorKey}>
                  <label>
                    <input
                      type="checkbox"
                      checked={enabledColors[colorKey]}
                      onChange={() => handleColorCheckboxChange(colorKey)}
                    />
                    {colorKey}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RTDoseViewer;
