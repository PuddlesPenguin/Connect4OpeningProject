import React from 'react';
import './index.css';

function Card({ title, text, image, link }) {
  return (
    <div className="card">
      <a href={link} target="_blank" rel="noopener noreferrer">
        <img className="card-image" src={image} alt="profile" />
        <h2 className="card-title">{title}</h2>
        <p className="card-text">{text}</p>
      </a>
    </div>
  );
}

export default Card;
