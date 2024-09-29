import React from 'react';
import './../index.css';
import Navbar from './../components/NavBar';

const PlayBot = () => {
  return (
    <>
      <header className="header">
      <h1>Play Bot</h1>
      </header>
     
      <Navbar
         link1="/" 
         text1="Home" 
         link2="/add-openings" 
         text2="Add Openings" 
         link3="/train-openings" 
         text3="Train Openings" 
         />
    </>
  );
};

export default PlayBot;