import React, { Component } from 'react';

import ndarray from 'ndarray';
import ops from 'ndarray-ops';

import '../App.css';
import ModelLoader from '../components/ModelLoader';
import ImageLoader from '../components/ImageLoader';
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

  runModel = () => {
    const imageData = this.state.imageData;
    const { data, width, height } = imageData;
    let dataTensor = ndarray(new Float32Array(data), [ width, height, 4]);
    let dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [
      width,
      height,
      3
    ]);
    ops.subseq(dataTensor.pick(null, null, 2), 103.939);
    ops.subseq(dataTensor.pick(null, null, 1), 116.779);
    ops.subseq(dataTensor.pick(null, null, 0), 123.68);
    ops.assign(
      dataProcessedTensor.pick(null, null, 0),
      dataTensor.pick(null, null, 2)
    );
    ops.assign(
      dataProcessedTensor.pick(null, null, 1),
      dataTensor.pick(null, null, 1)
    );
    ops.assign(
      dataProcessedTensor.pick(null, null, 2),
      dataTensor.pick(null, null, 0)
    );
    const inputData = { input_1: dataProcessedTensor.data };
    this.state.model.predict(inputData).then(outputData => {
      this.setState({
        output: outputData['fc1000'],
        topOutput: imagenetClassesTopK(outputData['fc1000'], 5)
      });
    });
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

  renderOutput = (output) => {
    return (
      <li>{output.name} {output.probability}</li>
    )
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Imagenet</h2>
        </div>
        <ModelLoader loadFunction={this.loadModel}
                   loadingPercent={this.state.loadingPercent}
                   modelLoaded={this.state.modelLoaded}
        />
        <ImageLoader imageUrl={this.state.imageUrl}
                     updateUrl={this.updateUrl}
                     updateImageLoaded={this.updateImageLoaded}
                     updateImageData={this.updateImageData}
        />
        <button onClick={this.runModel} disabled={!this.state.imageLoaded}>Run Model</button>
        <ul>
          {this.state.topOutput.map(this.renderOutput)}
        </ul>
      </div>
    );
  }
}

export default App;
