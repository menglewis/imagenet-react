import os
import json

import numpy as np
import h5py
from keras.applications import resnet50


class Encoder(object):
    """Encoder class.
    Weights are serialized sequentially from the Keras flattened_layers representation
    into:
        - `weights`: a binary string representing the raw data bytes in float32
            of all weights, sequentially concatenated.
        - `metadata`: a list containing the byte length and tensor shape,
            so that the original tensors can be reconstructed
    """

    def __init__(self, weights_hdf5_filepath):
        if not weights_hdf5_filepath:
            raise Exception('weights_hdf5_filepath must be defined.')
        self.weights_hdf5_filepath = weights_hdf5_filepath
        self.weights = b''
        self.metadata = []

    def serialize(self):
        """serialize method.
        Strategy for extracting the weights is adapted from the
        load_weights_from_hdf5_group method of the Container class:
        see https://github.com/fchollet/keras/blob/master/keras/engine/topology.py#L2505-L2585
        """
        hdf5_file = h5py.File(self.weights_hdf5_filepath, mode='r')
        if 'layer_names' not in hdf5_file.attrs and 'model_weights' in hdf5_file:
            f = hdf5_file['model_weights']
        else:
            f = hdf5_file

        layer_names = [n.decode('utf8') for n in f.attrs['layer_names']]
        offset = 0
        for layer_name in layer_names:
            g = f[layer_name]
            weight_names = [n.decode('utf8') for n in g.attrs['weight_names']]
            if len(weight_names):
                for weight_name in weight_names:
                    meta = {}
                    meta['layer_name'] = layer_name
                    meta['weight_name'] = weight_name
                    weight_value = g[weight_name].value
                    bytearr = weight_value.astype(np.float32).tobytes()
                    self.weights += bytearr
                    meta['offset'] = offset
                    meta['length'] = len(bytearr) // 4
                    meta['shape'] = list(weight_value.shape)
                    meta['type'] = 'float32'
                    self.metadata.append(meta)
                    offset += len(bytearr)

        hdf5_file.close()

    def save(self):
        """Saves weights data (binary) and weights metadata (json)
        """
        weights_filepath = '{}_weights.buf'.format(os.path.splitext(self.weights_hdf5_filepath)[0])
        with open(weights_filepath, mode='wb') as f:
            f.write(self.weights)
        metadata_filepath = '{}_metadata.json'.format(os.path.splitext(self.weights_hdf5_filepath)[0])
        with open(metadata_filepath, mode='w') as f:
            json.dump(self.metadata, f)


if __name__ == "__main__":
    WEIGHT_PATH = '../public/resnet50.hdf5'
    MODEL_PATH = '../public/resnet50.json'

    model = resnet50.ResNet50(include_top=True, weights='imagenet')
    model.save_weights(WEIGHT_PATH)
    with open(MODEL_PATH, 'w') as f:
        f.write(model.to_json())

    encoder = Encoder(WEIGHT_PATH)
    encoder.serialize()
    encoder.save()
