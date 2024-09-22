import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './../index.css';

function OpeningInfo({ title, text }) {
  return (
    <div className="openingInfo">
        <h2 className="openingInfo-title">{title}</h2>
        <p className="openingInfo-text">{text}</p>
    </div>
  );
}

export default OpeningInfo;
