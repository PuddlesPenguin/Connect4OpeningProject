import React, { useState } from 'react';
import './Connect4.css';

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;

const Connect4 = () => {
    const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);

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

        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === EMPTY) {
                const newBoard = board.map(row => [...row]);
                newBoard[row][col] = currentPlayer;
                setBoard(newBoard);

                if (checkWinner(row, col)) {
                    setWinner(currentPlayer);
                    setGameOver(true);
                } else if (newBoard.every(row => row.every(cell => cell !== EMPTY))) {
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
    };

    return (
        <div className="connect4">
            <h1>Connect 4</h1>
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
                                        className={`piece ${
                                            cell === PLAYER1 ? 'player1' : 'player2'
                                        }`}
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
    );
};

export default Connect4;