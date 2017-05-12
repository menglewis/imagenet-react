import React from 'react';


class ModelOutputs extends React.Component {
  renderBody = (output) => {
    return (
      <tr>
        <td>{output.name}</td>
        <td>{output.probability}</td>
      </tr>
    ) 
  }
  render() {
    return (
      <div>
        <h4>Top 5 Guesses</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Guess</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {this.props.outputs.map(this.renderBody)}
          </tbody>
        </table>
      </div>
    )
  }
}

ModelOutputs.propTypes = {
  outputs: React.PropTypes.array
}

export default ModelOutputs;
