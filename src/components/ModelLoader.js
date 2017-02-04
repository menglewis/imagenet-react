import React from 'react';


const ModelLoader = (props) => {
  if (props.modelLoaded) {
    return <div>Model Loaded</div>
  }
  return (
    <div>
      <button onClick={props.loadFunction}>Load Model</button>
      <p>{props.loadingPercent}</p>
    </div>
  )
}

ModelLoader.propTypes = {
  loadFunction: React.PropTypes.func,
  loadingPercent: React.PropTypes.number,
  modelLoaded: React.PropTypes.bool,
}

export default ModelLoader;
