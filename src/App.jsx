import React from 'react';
import { Routes, Route} from 'react-router-dom'
import FrontPage from './pages/FrontPage';  // Ensure this path is correct
import AddOpenings from './pages/AddOpenings';  // Ensure this path is correct
import TrainOpenings from './pages/TrainOpenings';  // Ensure this path is correct
import PlayBot from './pages/PlayBot';  // Ensure this path is correct

const App = () => {
  return (
    <>
        <Routes>
            <Route path="/" element={<FrontPage/>}/>
            <Route path="/add-openings" element={<AddOpenings/>}/>
            <Route path="/train-openings" element={<TrainOpenings/>}/>
            <Route path="/play-bot" element={<PlayBot/>}/>

        </Routes>
    </>
    
  );
};

export default App;
