import React from 'react';
import ndarray from 'ndarray';
import ops from 'ndarray-ops';

class ModelRunner extends React.Component {
  runModel = () => {
    this.props.updateModelRunning(true);
    const imageData = this.props.imageData;
    const inputData = this.preProcessData(imageData);

    this.props.model.predict(inputData).then(outputData => {
      this.props.setModelOutputs(outputData);
    });
  };

  preProcessData = (imageData) => {
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
    return inputData;
  };

  render() {
    return (
      <div>
        <button className="btn btn-default"
                onClick={this.runModel}
                disabled={!this.props.imageData}>
          Run Model
        </button>
      </div>
    )
  }
}

ModelRunner.propTypes = {
  imageData: React.PropTypes.object,
  model: React.PropTypes.object,
  setModelOutputs: React.PropTypes.func,
  updateModelRunning: React.PropTypes.func
}

export default ModelRunner;
