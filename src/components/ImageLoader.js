import React from 'react';

class ImageLoader extends React.Component {

  loadImage = (imageUrl = null) => {
    let imageSource = null;
    if (imageUrl !== null) {
      imageSource = 'https://crossorigin.me/' + imageUrl;
    } else {
      imageSource = this.refs.file.files[0];
    }
    window.loadImage(
      imageSource,
      img => {
        if (img.type === 'error') {
          console.log('Error loading image');
        }
        else {
          const ctx = this.refs.canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          this.props.updateImageLoaded(true);
          this.props.updateImageData(ctx.getImageData(
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
          ));
        }
      },
      {
        maxWidth: 224,
        maxHeight: 224,
        cover: true,
        crop: true,
        canvas: true,
        crossOrigin: 'Anonymous'
      }
    )
  }

  render() {
    return (
      <div>
        <div>
          <div>Enter a valid image URL or upload an image:</div>
          <input type="text" name="imageUrl" placeholder="Image URL" value={this.props.imageUrl} onChange={(e) => this.props.updateUrl(e.target.value)} />
          <button onClick={() => this.loadImage(this.props.imageUrl)}>Load Image</button>
          <span> or </span>
          <input type="file" name="file" ref="file" onChange={() => this.loadImage()} />
        </div>
        <div>
          <canvas ref="canvas" width={224} height={224} />
        </div>
      </div>
    )
  }
}

ImageLoader.propTypes = {
  imageUrl: React.PropTypes.string,
  updateUrl: React.PropTypes.func,
  updateImageLoaded: React.PropTypes.func,
  updateImageData: React.PropTypes.func
}

export default ImageLoader;
