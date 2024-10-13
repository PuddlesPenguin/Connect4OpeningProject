import React from 'react';
import './../index.css';
import Navbar from './../components/NavBar';
import { useState, useEffect } from 'react';
import { db } from './../config/firebase.js';
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const AddOpenings = () => {
  
    return (
    <>
      <header className="header">
      <h1>Add Openings</h1>
      </header>
     
      <Navbar
         link1="/" 
         text1="Home" 
         link2="/train-openings" 
         text2="Train Openings" 
         link3="/play-bot" 
         text3="PlayBot" 
      />
    </>
    );
  };
  
  export default AddOpenings; 