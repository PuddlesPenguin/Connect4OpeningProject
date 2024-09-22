import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './../index.css';

function Card({ title, text, image, link }) {
  return (
    <Link to={link}> 
      <div className="card">
        <img className="card-image" src={image} alt={title} /> {/* Use title for alt text */}
        <h2 className="card-title">{title}</h2>
        <p className="card-text">{text}</p>
    </div>
    </Link>

  );
}

export default Card;
