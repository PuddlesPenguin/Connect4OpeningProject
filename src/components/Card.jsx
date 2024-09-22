import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './../index.css';

function Card({ title, text, image, link }) {
  return (
    <div className="card">
      <Link to={link}> {/* Use Link instead of a */}
        <img className="card-image" src={image} alt={title} /> {/* Use title for alt text */}
        <h2 className="card-title">{title}</h2>
        <p className="card-text">{text}</p>
      </Link>
    </div>
  );
}

export default Card;
