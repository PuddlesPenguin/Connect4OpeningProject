import React, { useState, useEffect } from 'react';
import './../Connect4.css';
import BasicExample from './../components/DropDown';
import Navbar from './../components/NavBar';
import { db } from './../config/firebase.js';
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import Button from '../components/Button.jsx';

const openingsJSON = `[
    "2123456",
    "232414",
    "4564117",
    "233445",
    "1231134",
    "111333"
]`;


const decodeOpenings = (json) => {
    const openingsArray = JSON.parse(json);
    return openingsArray.map((opening) => opening.split('').map(Number));
};

const arrayToString = (array) => {
    return array.join('');
};

const openingsArray = decodeOpenings(openingsJSON);
const openingIdx = Math.floor(Math.random() * openingsArray.length);
console.log(openingsArray[openingIdx])
const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;
let x = 0;

const TrainOpenings = () => {
    const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [moveCounter, setMoveCounter] = useState(0); 
    const [jsonArray, setJsonArray] = useState([]);
    const [newOpeningSeq, setNewOpeningSeq] = useState("");
    const [newTerminate, setNewTerminate] = useState(false);
    const [openings, setOpenings] = useState([]);
    const openingsCollectionRef = collection(db, "openings");
    const [newJSON, setNewJSON] = useState("");

    const createOpening = async () => {
        try {
            await addDoc(openingsCollectionRef, {openingSeq: newOpeningSeq, terminate: newTerminate});
        } catch (error) {
            console.error("Error adding opening: ", error);
            alert("Failed to add opening.");
        }
    };

    const BranchToFirebase = async (buttonOpeningSeq, buttonTerminate) => {
        try {
            await addDoc(openingsCollectionRef, {openingSeq: buttonOpeningSeq, terminate: buttonTerminate});
            alert("Openings added successfully!");
        } catch (error) {
            console.error("Error adding opening: ", error);
            alert("Failed to branch openings.");
        }
    };
    const branchOpenings = () => {
        const x1 = [...jsonArray, 1];
        const x2 = [...jsonArray, 2];
        const x3 = [...jsonArray, 3];
        const x4 = [...jsonArray, 4];
        const x5 = [...jsonArray, 5];
        const x6 = [...jsonArray, 6];
        const x7 = [...jsonArray, 7];
        const y1 = arrayToString(x1);
        const y2 = arrayToString(x2);
        const y3 = arrayToString(x3);
        const y4 = arrayToString(x4);
        const y5 = arrayToString(x5);
        const y6 = arrayToString(x6);
        const y7 = arrayToString(x7);
        BranchToFirebase (y1, false);
        BranchToFirebase (y2, false);
        BranchToFirebase (y3, false);
        BranchToFirebase (y4, false);
        BranchToFirebase (y5, false);
        BranchToFirebase (y6, false);
        BranchToFirebase (y7, false);
        alert("Opening added successfully!");
    }


    useEffect(() => {
        const getOpenings = async () => {
            try {
                const data = await getDocs(openingsCollectionRef);
                setOpenings(data.docs.map(doc => ({ id: doc.id, ...doc.data()})));
            } catch (error) {
                console.error("Error fetching opening: ", error);
            }
        };
        getOpenings();
    }, []);
    const playInitialMoves = async () => {
        if (x != 1) {
            x = x + 1;
            if (moveCounter < openingsArray[openingIdx].length) {
                await new Promise(resolve => {
                    setTimeout(() => {
                        dropPiece(openingsArray[openingIdx][moveCounter] - 1);
                        resolve();
                    }, 1000); // 1000ms delay for each move
                });
            }    
        }
    };


    useEffect(() => {
        playInitialMoves();
        console.log("JSON Sequence being played", newJSON);
    }, [moveCounter]); 

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

    const dropPiece = (col) => {
        setNewJSON(x => (x + (col+1)));
        if (gameOver) return;
        console.log("Dropping piece in column:", col);
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === EMPTY) {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = currentPlayer;
                setBoard(newBoard);
                setJsonArray(prevJsonArray => [...prevJsonArray, col + 1]);
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
        setMoveCounter(0); 
        setJsonArray([]);
    };

    return (
        <>

         <header className="header">
            <h1>Train Openings</h1>
        </header>
        <Navbar
         link1="/" 
         text1="Home" 
         link2="/add-openings" 
         text2="Add Openings" 
         link3="/play-bot" 
         text3="PlayBot" 
      />

<div className="connect4">
    <div className="board">
        {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
                {row.map((cell, colIndex) => (
                    <div
                        key={colIndex}
                        className="cell"
                        onClick={() => dropPiece(colIndex)}
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
        <button className="button" onClick={createOpening}>Branch Openings</button>
    </div>
</div>

        </>
    );
};

export default TrainOpenings;
