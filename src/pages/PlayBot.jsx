import React, { useState, useEffect } from 'react';
import './../Connect4.css';
import BasicExample from './../components/DropDown';
import Navbar from './../components/NavBar';
import { db } from './../config/firebase.js';
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import Button from '../components/Button.jsx';
import axios from 'axios';
import { doc, deleteDoc } from "firebase/firestore";
const openingsJSON = `[
    "12345",
    "23456",
    "65432",
    "54321",
    "34567",
    "76543"
]`;


const decodeOpenings = (json) => {
    const openingsArray = JSON.parse(json);
    return openingsArray.map((opening) => opening.split('').map(Number));
};

const decodeOpening = (openingString) => {
    return openingString.split('').map(Number);
};

const arrayToString = (array) => {
    return array.join('');
};

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;
let x = 0;
let lock = false;
let lock2 = Promise.resolve();

const PlayBot = () => {
    const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [moveCounter, setMoveCounter] = useState(0); 
    const [jsonArray, setJsonArray] = useState([]);
    const [openings, setOpenings] = useState([]);
    const openingsCollectionRef = collection(db, "openings");
    const [newJSON, setNewJSON] = useState("");
    const [gameCount, setGameCount] = useState(-1);
    const [openingArray, setOpeningArray] = useState([4]);
    const [userMoveCount, setUserMoveCount] = useState(0);
    const [openingPermision, setOpeningPermission] = useState(false);
    const [solverArray, setSolverArray] = useState([]);
    const [showIntro, setShowIntro] = useState(true);  // New state for intro screen visibility
    const [moveHistory, setMoveHistory] = useState([]); // New state to track move history
    const [isBranchClicked, setIsBranchClicked] = useState(false);
    const [isTerminateClicked, setIsTerminateClicked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(true);



            
    const goBack = () => {
      if (moveHistory.length === 0 || gameOver) return; // No move to undo or game is over

      const lastMove = moveHistory[moveHistory.length - 1];
      const newBoard = board.map(r => [...r]);
      newBoard[lastMove.row][lastMove.col] = EMPTY;
      setNewJSON(prevJSON => prevJSON.slice(0, -1));
      setBoard(newBoard);
      setMoveHistory(prevHistory => prevHistory.slice(0, -1)); // Remove the last move
      setJsonArray(prevJsonArray => prevJsonArray.slice(0, -1)); // Update JSON array
      setCurrentPlayer(currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1); // Revert player turn
      setMoveCounter(prevIndex => prevIndex - 1);
      setGameOver(false); // Reset gameOver flag in case it was set
      setWinner(null); // Reset winner if necessary
      setUserMoveCount(prevIndex => prevIndex - 1);
  };

    

    const handleClick = (colIndex) => {
        dropPiece(colIndex); // Call your function to drop the piece
        setUserMoveCount((prevCount) => prevCount + 1); // Increment the move count
    };
    useEffect(() => {
        validateMove();
        console.log(isCorrect);
    }, [moveCounter]); // Dependencies ensure this runs only when `moveCounter` changes
    
    const validateMove = () => {
        if (
            moveCounter > 0 && // Ensure moveCounter is valid
            moveCounter <= openingArray.length && // Prevent out-of-bounds access
            openingArray[moveCounter - 1] !== jsonArray[moveCounter - 1] // Compare moves
        ) {
            setIsCorrect(false);
        }
    };
    
    const playInitialMoves = async () => {
      if (lock) return;  // If the function is already running, return immediately
      lock = true;

      try {
          if (moveCounter % 2 === 1) {
              await new Promise(resolve => {
                  setTimeout(() => {
                    let x = -1; // Best move column
                    let y = -1; // Second-best move column
                    let max1 = -1000; // Best move score
                    let max2 = -1000; // Second-best move score
                    
                    for (let i = 0; i < 7; i++) {
                        // Skip unplayable columns
                        if (solverArray[i] === 100) continue;
                    
                        if (solverArray[i] > max1) {
                            // Shift current best to second-best
                            max2 = max1;
                            y = x;
                    
                            // Update best
                            max1 = solverArray[i];
                            x = i;
                        } else if (solverArray[i] > max2) {
                            // Update second-best
                            max2 = solverArray[i];
                            y = i;
                        }
                    }
                    
                    // Decide probabilistically between the best and second-best moves
                    let chosenColumn = x; // Default to the best move
                    if (y !== -1 && Math.random() < 0.2 && moveCounter < 25 && max2 >= -5) {
                        chosenColumn = y; // 30% chance to choose the second-best move
                    }
                    dropPiece(chosenColumn);
                    resolve();
                  }, 600); // 1000ms delay for each move
              });
          } 
      } finally {
          lock = false;  // Release the lock
      }
    };

    useEffect(() => {
        setOpeningPermission(x => !x);
    }, [moveCounter]);

    useEffect(() => {
        if (newJSON) {
            // Once newJSON updates, make the axios call
            const fetchData = async () => {
                const response = await axios.get("https://connect4.gamesolver.org/solve", {
                    params: {
                        pos: newJSON
                    }
                });
                console.log(response.data.score, "Response");
                setSolverArray(response.data.score);
            };
            fetchData();
        }
    }, [moveCounter]);

        
    useEffect(() => {
        console.log(openingArray);
        playInitialMoves();
        console.log("JSON Sequence being played", newJSON);
    }, [solverArray]); 



    const checkWinner = (row, col) => {
        const directions = [
            [0, 1],  // horizontal
            [1, 0],  // vertical
            [1, 1],  // diagonal down-right
            [1, -1], // diagonal down-left
        ];

        for (let [dx, dy] of directions) {
            let count = 1;
            for (let i = 1; i < 4; i++) {
                const newRow = row + i * dx;
                const newCol = col + i * dy;
                if (
                    newRow >= 0 && newRow < ROWS &&
                    newCol >= 0 && newCol < COLS &&
                    board[newRow][newCol] === currentPlayer
                ) {
                    count++;
                } else {
                    break;
                }
            }
            for (let i = 1; i < 4; i++) {
                const newRow = row - i * dx;
                const newCol = col - i * dy;
                if (
                    newRow >= 0 && newRow < ROWS &&
                    newCol >= 0 && newCol < COLS &&
                    board[newRow][newCol] === currentPlayer
                ) {
                    count++;
                } else {
                    break;
                }
            }
            if (count >= 4) {
                return true;
            }
        }
        return false;
    };

    const dropPiece = async (col) => {
        // Update newJSON asynchronously
        setNewJSON(x => (x + (col + 1)));     
        // Don't make the axios call yet, we will handle that inside useEffect
        if (gameOver) return;
    
        console.log("Dropping piece in column:", col);
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === EMPTY) {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = currentPlayer;
                setBoard(newBoard);
                setJsonArray(prevJsonArray => [...prevJsonArray, col + 1]);
                setMoveHistory(prevHistory => [...prevHistory, { row, col }]); // Track the move
                if (checkWinner(row, col)) {
                    setWinner(currentPlayer);
                    setGameOver(true);
                } else if (newBoard.every(r => r.every(cell => cell !== EMPTY))) {
                    setGameOver(true);
                } else {
                    setCurrentPlayer(currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1);
                }
                break;
            }
        }    
        setMoveCounter(prevIndex => {
            const newMoveCounter = prevIndex + 1; // Increment move counter
            console.log("Move counter updated to:", newMoveCounter); // Log the new counter
            x = x + 1;
            return newMoveCounter; // Return the updated counter
        });

    };


    const resetGame = () => {
        setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
        setCurrentPlayer(PLAYER1);
        setWinner(null);
        setGameOver(false);
        setJsonArray([]);
        setNewJSON("");
        setMoveHistory([]); 
        setGameCount(x => (x+1));
        setMoveCounter(x => 0);
        setUserMoveCount(x => 0);
        setIsBranchClicked(false);
        setIsTerminateClicked(false);
    };

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

<div className="connect4">
    <div className="board">
        {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
                {row.map((cell, colIndex) => (
                    <div
                        key={colIndex}
                        className="cell"
                        onClick={() => handleClick(colIndex)}
                    >
                        {cell !== EMPTY && (
                            <div
                                className={`piece ${cell === PLAYER1 ? 'player1' : 'player2'}`}
                            />
                        )}
                    </div>
                ))}
            </div>
        ))}
    </div>
    {gameOver && (
        <div className="game-over">
            <h2>Game Over</h2>
            <p>{winner ? `Player ${winner} wins!` : "It's a draw!"}</p>
            <button className="reset-button" onClick={resetGame}>
                New Game
            </button>
        </div>
    )}
</div>


<div className="databaseButtons">
    <div className="blueButton">
        <button className="button" onClick={resetGame}>Reset Game</button>
    </div>
    <div className="purpleButton">
        <button className="button" onClick={goBack}>Go Back</button>
    </div>

</div>


        </>
    );
};

export default PlayBot;
