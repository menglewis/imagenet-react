import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.css';
import '../App.css';

import ModelLoader from '../components/ModelLoader';
import ModelRunner from '../components/ModelRunner';
import ModelOutputs from '../components/ModelOutputs';
import ImageLoader from '../components/ImageLoader';
import LoadingOverlay from '../components/LoadingOverlay';
import { imagenetClassesTopK } from '../utils';

class App extends Component {

  constructor() {
    super();
    
    this.state = {
      model: null,
      modelLoaded: false,
      modelLoading: false,
      modelRunning: false,
      hasWebgl: this.hasWebgl(),
      loadingPercent: 0,
      imageUrl: '',
      imageLoaded: false,
      imageData: null,
      output: null,
      topOutput: []
    }
  }

  hasWebgl() {
    let hasWebgl = false;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      hasWebgl = true
    }
    return hasWebgl;
  }

  loadModel = () => {
    const model = new window.KerasJS.Model({
      filepaths: {
        model: 'resnet50.json',
        weights: 'resnet50_weights.buf',
        metadata: 'resnet50_metadata.json'
      },
      gpu: this.state.hasWebgl,
      layerCallPauses: true
    });
    let interval = setInterval(() => {
      const percent = model.getLoadingProgress();
      this.setState({
        loadingPercent: percent
      });
    }, 100);

    model.ready().then(() => {
      clearInterval(interval);
      this.setState({
        loadingPercent: 100,
        modelLoading: false,
        modelLoaded: true
      });
    })
    .catch(err => {
      clearInterval(interval);
      console.log(err);
    });

    this.setState({
      modelLoading: true,
      model: model
    });
  };
  
  updateModelRunning = (value) => {
    this.setState({
      modelRunning: value
    })
  };
  
  setModelOutputs = (outputData) => {
    this.setState({
      modelRunning: false,
      output: outputData['fc1000'],
      topOutput: imagenetClassesTopK(outputData['fc1000'], 5) 
    })
  };

  updateUrl = (value) => {
    this.setState({
      imageUrl: value
    })
  };

  updateImageLoaded = (value) => {
    this.setState({
      imageLoaded: value
    })
  };

  updateImageData = (value) => {
    this.setState({
      imageData: value
    })
  };

  renderModelForm = () => {
    return (
      <div className="row">
        <div className="col-md-6">
          <ImageLoader imageUrl={this.state.imageUrl}
                       updateUrl={this.updateUrl}
                       updateImageLoaded={this.updateImageLoaded}
                       updateImageData={this.updateImageData}
          />
          <ModelRunner imageData={this.state.imageData}
                       model={this.state.model}
                       setModelOutputs={this.setModelOutputs}
                       updateModelRunning={this.updateModelRunning}
          />
        </div>
        <div className="col-md-6">
          {this.state.output && <ModelOutputs outputs={this.state.topOutput} />}
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className="container">
        {
          !this.state.modelLoaded &&
          <ModelLoader loadFunction={this.loadModel}
                       loadingPercent={this.state.loadingPercent}
                       modelLoaded={this.state.modelLoaded}
          />
        }
        {
          this.state.modelLoaded && this.renderModelForm()
        }
        {
          (this.state.modelLoading || this.state.modelRunning) && <LoadingOverlay />
        }
      </div>
    );
  }
}

export default App;
