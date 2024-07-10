import React from 'react';
import './Slide.css';

const Slide = ({ slide, className, style, onMouseEnter, onMouseLeave }) => {
  return (
    <div className={className} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="slide-background" style={{ backgroundImage: `url(${slide.image})` }}></div>
      <div className="slide-content">
        <h4>{slide.category}</h4>
        <p>{slide.name}</p>
        <p>{slide.year}</p>
        <p>{slide.price}</p>
      </div>
    </div>
  );
};

export default Slide;
