import React from 'react';
import './../index.css';
import Card from '../components/Card.jsx';  // Ensure this imports your Card component
import addOpeningLogo from './../assets/treelogo.png';
import trainOpeningLogo from './../assets/practice.jpg';
import playBotLogo from './../assets/bot.jpg';
import { Link } from 'react-router-dom';

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
          link={<Link to="/add-openings">Go to Add Openings</Link>}
        />
        <Card
          title="Train Openings"
          text="Train from connect 4 openings in your database!"
          image={trainOpeningLogo}
          link={<Link to="/train-openings">Go to Train Openings</Link>}
        />
        <Card
          title="Play Bot"
          text="Test yourself against a perfect connect 4 bot!"
          image={playBotLogo}
          link={<Link to="/play-bot">Go to Play Bot</Link>}
        />
      </div>
    </>
  );
}

export default FrontPage;
