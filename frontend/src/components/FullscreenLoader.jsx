import React from 'react';

const FullscreenLoader = ({ message = 'Loading' }) => (
  <div className="fullscreen-loader">
    <div className="spinner" />
    <p>{message}</p>
  </div>
);

export default FullscreenLoader;
