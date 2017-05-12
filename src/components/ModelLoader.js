import React from 'react';


const ModelLoader = (props) => {
  if (props.modelLoaded) {
    return <div>Model Loaded</div>
  }
  return (
    <div>
      <button className="btn btn-default"
              onClick={props.loadFunction}>
        Load Model (~100MB)
      </button>
    </div>
  )
}

ModelLoader.propTypes = {
  loadFunction: React.PropTypes.func,
  loadingPercent: React.PropTypes.number,
  modelLoaded: React.PropTypes.bool,
}

export default ModelLoader;
