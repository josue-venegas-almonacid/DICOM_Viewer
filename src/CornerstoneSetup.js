// src/CornerstoneSetup.js
import cornerstone from 'cornerstone-core';
import dicomParser from 'dicom-parser';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

export function initializeCornerstone() {
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  
  cornerstoneWADOImageLoader.configure({
    beforeSend: function(xhr) {
      // Add custom headers here (if needed)
    }
  });
}
