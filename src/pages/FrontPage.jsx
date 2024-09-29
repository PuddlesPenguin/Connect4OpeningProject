import React from 'react';
import './../index.css';
import Card from '../components/Card.jsx';  // Ensure this imports your Card component
import addOpeningLogo from './../assets/treelogo.png';
import trainOpeningLogo from './../assets/practice.jpg';
import playBotLogo from './../assets/bot.jpg';
import { Link } from 'react-router-dom';
import Connect4 from './../Connect4.jsx'

function FrontPage() {
  return (
    <>
      <header className="header">
        <h1>Connect 4 Opening Website</h1>
      </header>
      <div className="card-container">
        <Card
          title="Add Openings"
          text="Add connect 4 openings to your database!"
          image={addOpeningLogo}
          link="/add-openings"
        />
        <Card
          title="Train Openings"
          text="Train from connect 4 openings in your database!"
          image={trainOpeningLogo}
          link="/train-openings"
        />
        <Card
          title="Play Bot"
          text="Test yourself against a perfect connect 4 bot!"
          image={playBotLogo}
          link="/play-bot"
        />
        
      </div>
    </>
  );
}

export default FrontPage;
