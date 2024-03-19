import React, { useState } from 'react';
import reactCSS from 'reactcss';
import { BlockPicker, TwitterPicker } from 'react-color';

function SketchExample({ onData }) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState({ r: '241', g: '112', b: '19', a: '1' });

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (newColor) => {
    setColor(newColor.rgb);
    onData(newColor.hex);
  };


  const styles = reactCSS({
    default: {
      color: {
        width: '36px',
        height: '14px',
        borderRadius: '2px',
        background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
      },
      swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
      },
      popover: {
        position: 'absolute',
        zIndex: '2',
        color: 'white',
      },
      cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    },
  });


  return (
    <div >
      <button style={styles.swatch} onClick={handleClick}>
        <div style={styles.color} />
      </button>
      {displayColorPicker && (
        <div style={styles.popover}>
          <div style={styles.cover} onClick={handleClose} />
          <TwitterPicker color={color} onChange={handleChange} />
        </div>
      )}
    </div>
  );
}

export default SketchExample;
