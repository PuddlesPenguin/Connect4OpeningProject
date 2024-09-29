import React, { useState, useEffect } from 'react';
import './../Connect4.css';
import BasicExample from './../components/DropDown';
import Navbar from './../components/NavBar';
const openingsJSON = `[
    "2123456",
    "232414",
    "4564117",
    "233445",
    "1231134"
]`;

const decodeOpenings = (json) => {
    const openings = JSON.parse(json);
    return openings.map((opening) => opening.split('').map(Number));
};

const openings = decodeOpenings(openingsJSON);
const openingIdx = Math.floor(Math.random() * openings.length);
console.log(openings[openingIdx])
const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;
let newJSON = ''

const TrainOpenings = () => {
    const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [moveCounter, setMoveCounter] = useState(0); // Start at 0
    const [jsonArray, setJsonArray] = useState([]);

    useEffect(() => {
        const playInitialMoves = async () => {
            if (moveCounter < openings[openingIdx].length) {
                await new Promise(resolve => {
                    setTimeout(() => {
                        dropPiece(openings[openingIdx][moveCounter] - 1); // Adjust for zero indexing
                        resolve();
                    }, 1000); // 1000ms delay for each move
                });
            }
        };

        playInitialMoves();
        console.log(moveCounter);
        console.log(newJSON);
    }, [moveCounter]); // Dependency on moveCounter

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
        if (gameOver) return;
        newJSON = newJSON + (col+1);
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === EMPTY) {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = currentPlayer;
                setBoard(newBoard);
                setMoveCounter(prevCount => prevCount + 1);
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
    };

    const resetGame = () => {
        setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
        setCurrentPlayer(PLAYER1);
        setWinner(null);
        setGameOver(false);
        setMoveCounter(0); // Reset move counter
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
        </>
    );
};

export default TrainOpenings;
