import React, { useState, useEffect } from 'react';

// JSON Representation of Openings
const openingsJSON = `[
  "4435",
  "3435",
  "4342"
]`;

/**
 * Decodes a JSON string of Connect Four openings into an array of move sequences.
 *
 * @param {string} json - The JSON string representing the openings.
 * @returns {number[][]} An array where each sub-array is a sequence of column moves.
 */
const decodeOpenings = (json) => {
  const openings = JSON.parse(json);
  return openings.map((opening) => opening.split('').map(Number));
};

// Decode the openings
const openings = decodeOpenings(openingsJSON);

/**
 * Cell Component
 * Represents a single cell in the Connect Four board.
 */
const Cell = ({ value, onClick }) => {
  const getCellColor = () => {
    if (value === 'player1') return '#FF4136'; // Red
    if (value === 'player2') return '#FFDC00'; // Yellow
    return '#FFFFFF'; // Empty
  };

  const cellStyle = {
    width: '60px',
    height: '60px',
    backgroundColor: '#007BFF',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: value === null ? 'pointer' : 'default',
    boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s',
  };

  const discStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: getCellColor(),
    transition: 'background-color 0.3s',
  };

  return (
      <div style={cellStyle} onClick={onClick}>
        <div style={discStyle}></div>
      </div>
  );
};

/**
 * Board Component
 * Represents the Connect Four board.
 */
const Board = ({ board, handleUserMove }) => {
  const boardStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 60px)',
    gridTemplateRows: 'repeat(6, 60px)',
    gap: '5px',
    justifyContent: 'center',
    margin: '20px auto',
  };

  return (
      <div style={boardStyle}>
        {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
                <Cell
                    key={`${rowIndex}-${colIndex}`}
                    value={cell}
                    onClick={() => handleUserMove(colIndex + 1)}
                />
            ))
        )}
      </div>
  );
};

/**
 * App Component
 * Main application component.
 */
const TrainOpenings = () => {
  // State Variables
  const [currentOpeningIndex, setCurrentOpeningIndex] = useState(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [boardState, setBoardState] = useState(
      Array(6)
          .fill(null)
          .map(() => Array(7).fill(null))
  ); // 6 rows x 7 columns
  const [gameActive, setGameActive] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('player1'); // 'player1' or 'player2'
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState(null);

  // Start Training Session
  const startTraining = () => {
    // Randomly select an opening
    const openingIdx = Math.floor(Math.random() * openings.length);
    setCurrentOpeningIndex(openingIdx);
    setCurrentMoveIndex(0);
    setBoardState(
        Array(6)
            .fill(null)
            .map(() => Array(7).fill(null))
    );
    setGameActive(true);
    setCurrentPlayer('player1');
    setMessage('Training started! Watch the opening moves...');
    setWinner(null);
  };

  // Play Opening Moves Sequentially
  useEffect(() => {
    if (gameActive && currentOpeningIndex !== null && !winner) {
      const opening = openings[currentOpeningIndex];
      if (currentMoveIndex < opening.length) {
        const move = opening[currentMoveIndex];
        // Simulate a delay between moves
        const timer = setTimeout(() => {
          makeMove(move, currentPlayer);
          if (checkWin(boardState, move - 1)) {
            setWinner(currentPlayer);
            setMessage(`${capitalize(currentPlayer)} wins during the opening!`);
            setGameActive(false);
            return;
          }
          setCurrentMoveIndex((prev) => prev + 1);
          setCurrentPlayer((prev) => (prev === 'player1' ? 'player2' : 'player1'));
        }, 700); // 700ms delay

        return () => clearTimeout(timer);
      } else {
        setMessage("Now it's your turn! Click on a column to make your move.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameActive, currentMoveIndex, currentOpeningIndex, currentPlayer, winner]);

  /**
   * Handles user clicking on a column to make a move.
   * Validates against opening if in training phase.
   */
  const handleUserMove = (column) => {
    if (!gameActive || winner) return;

    const opening = openings[currentOpeningIndex];
    if (currentMoveIndex < opening.length) {
      // During opening phase
      const expectedMove = opening[currentMoveIndex];
      if (column === expectedMove) {
        makeMove(column, currentPlayer);
        if (checkWin(boardState, column - 1)) {
          setWinner(currentPlayer);
          setMessage(`${capitalize(currentPlayer)} wins!`);
          setGameActive(false);
          return;
        }
        setMessage('Good move!');
        setCurrentMoveIndex((prev) => prev + 1);
        setCurrentPlayer((prev) => (prev === 'player1' ? 'player2' : 'player1'));

        if (currentMoveIndex + 1 >= opening.length) {
          setMessage('You have successfully completed the opening! Continue playing.');
          setGameActive(false);
        }
      } else {
        setMessage(`Incorrect move. Expected column ${expectedMove}. Try again!`);
      }
    } else {
      // After opening phase, regular gameplay
      makeMove(column, currentPlayer);
      if (checkWin(boardState, column - 1)) {
        setWinner(currentPlayer);
        setMessage(`${capitalize(currentPlayer)} wins!`);
        setGameActive(false);
        return;
      }
      setCurrentPlayer((prev) => (prev === 'player1' ? 'player2' : 'player1'));
      setMessage(`${capitalize(currentPlayer === 'player1' ? 'player2' : 'player1')} turn.`);
    }
  };

  /**
   * Makes a move on the board.
   *
   * @param {number} column - The column number (1-7).
   * @param {string} player - 'player1' or 'player2'.
   */
  const makeMove = (column, player) => {
    const updatedBoard = boardState.map((row) => [...row]);
    for (let row = 5; row >= 0; row--) {
      if (updatedBoard[row][column - 1] === null) {
        updatedBoard[row][column - 1] = player;
        break;
      }
    }
    setBoardState(updatedBoard);
  };

  /**
   * Checks if the current move causes a win.
   *
   * @param {Array} board - The current board state.
   * @param {number} lastMoveCol - The column index (0-6) where the last disc was placed.
   * @returns {boolean} - True if there's a win, else false.
   */
      //todo:fix the fact that this is broken
  const checkWin = (board, lastMoveCol) => {
    const lastRow = board.findIndex((row) => row[lastMoveCol] !== null);
    if (lastRow === -1) return false;
    const player = board[lastRow][lastMoveCol];
    if (!player) return false;

    // Directions: horizontal, vertical, diagonal (/), diagonal (\)
    const directions = [
      { dr: 0, dc: 1 }, // horizontal
      { dr: 1, dc: 0 }, // vertical
      { dr: 1, dc: 1 }, // diagonal \
      { dr: 1, dc: -1 }, // diagonal /
    ];

    for (let { dr, dc } of directions) {
      let count = 1;

      // Check in the positive direction
      let r = lastRow + dr;
      let c = lastMoveCol + dc;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
        count++;
        r += dr;
        c += dc;
      }

      // Check in the negative direction
      r = lastRow - dr;
      c = lastMoveCol - dc;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
        count++;
        r -= dr;
        c -= dc;
      }

      if (count >= 4) return true;
    }

    return false;
  };

  /**
   * Capitalizes the first letter of a string.
   *
   * @param {string} str - The string to capitalize.
   * @returns {string} - The capitalized string.
   */
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  /**
   * Resets the game to its initial state.
   */
  const resetGame = () => {
    setCurrentOpeningIndex(null);
    setCurrentMoveIndex(0);
    setBoardState(
        Array(6)
            .fill(null)
            .map(() => Array(7).fill(null))
    );
    setGameActive(false);
    setCurrentPlayer('player1');
    setMessage('');
    setWinner(null);
  };

  // Styling for the container
  const containerStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  // Styling for buttons
  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '1em',
    cursor: 'pointer',
    margin: '10px',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
  };

  const startButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
  };

  const resetButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
  };

  // Styling for the message
  const messageStyle = {
    marginTop: '20px',
    fontSize: '1.2em',
    color: '#555',
    minHeight: '1.2em', // To maintain space even when empty
  };

  return (
      <div style={containerStyle}>
        <h1>Connect Four Training</h1>
        <div>
          <button
              style={startButtonStyle}
              onClick={startTraining}
              disabled={gameActive && currentMoveIndex < (openings[currentOpeningIndex]?.length || 0)}
          >
            Start Training
          </button>
          <button style={resetButtonStyle} onClick={resetGame}>
            Reset
          </button>
        </div>
        <Board board={boardState} handleUserMove={handleUserMove} />
        <div style={messageStyle}>
          {winner
              ? `${capitalize(winner)} wins!`
              : message}
        </div>
      </div>
  );
};

/**
 * Helper function to check if the board is full.
 *
 * @param {Array} board - The current board state.
 * @returns {boolean} - True if the board is full, else false.
 */
const isBoardFull = (board) => {
  return board.every(row => row.every(cell => cell !== null));
};

export default TrainOpenings;
