import React from 'react';

import '../loading.css';

const LoadingOverlay = (props) => {
  return (
    <div className="loading-overlay active">
      <div className="spinner">
        Loading...
      </div>
    </div>
  )
}


export default LoadingOverlay;
