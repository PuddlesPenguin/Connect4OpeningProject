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

const TrainOpenings = () => {
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


    const handleStartProgram = () => {
        setShowIntro(false);  // Hide the intro screen when the button is clicked
    };

    const BranchToFirebase = async (buttonOpeningSeq, buttonTerminate) => {
        // Wait for the lock to be available
        await lock2;
    
        // Acquire the lock by creating a new promise and update lock2 to ensure exclusive access
        lock2 = new Promise(async (resolve) => {
            try {
                console.log("Adding new opening to Firestore and localStorage:", buttonOpeningSeq, buttonTerminate);
    
                // Add the new opening to Firestore
                const docRef = await addDoc(openingsCollectionRef, {
                    openingSeq: buttonOpeningSeq,
                    terminate: buttonTerminate,
                    weight: 16,
                });
                console.log("Document added to Firestore with ID:", docRef.id);
    
                // Fetch current openings from localStorage
                const currentOpenings = JSON.parse(localStorage.getItem('openings')) || [];
                console.log("Current localStorage openings:", currentOpenings);
    
                // Add the new opening to the local array
                const newOpening = { id: docRef.id, openingSeq: buttonOpeningSeq, terminate: buttonTerminate, weight: 16 };
                const updatedOpenings = [...currentOpenings, newOpening];
    
                // Update localStorage
                localStorage.setItem('openings', JSON.stringify(updatedOpenings));
                console.log("Updated localStorage openings:", updatedOpenings);
    
                // Update component state
                setOpenings(updatedOpenings);
            } catch (error) {
                console.error("Error adding opening to Firestore and localStorage:", error);
            } finally {
                resolve();  // Release the lock when done
            }
        });
    };
            
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

    const deleteOpeningBySeq = async (openingSeq) => {
        // Wait for the lock to be available
        await lock2;

        // Acquire the lock by creating a new promise and update lock2 to ensure exclusive access
        lock2 = new Promise(async (resolve) => {
            try {
                console.log("Deleting opening by sequence:", openingSeq);

                // Fetch current openings from localStorage
                const currentOpenings = JSON.parse(localStorage.getItem('openings')) || [];
                const opening = currentOpenings.find((item) => item.openingSeq === openingSeq);

                if (opening) {
                    console.log("Found opening to delete:", opening);

                    // Delete the document from Firestore
                    const docRef = doc(db, "openings", opening.id);
                    await deleteDoc(docRef);
                    console.log("Document successfully deleted from Firestore:", opening.id);

                    // Update localStorage
                    const updatedOpenings = currentOpenings.filter((item) => item.openingSeq !== openingSeq);
                    localStorage.setItem('openings', JSON.stringify(updatedOpenings));
                    console.log("Updated localStorage openings after deletion:", updatedOpenings);

                    // Update component state
                    setOpenings(updatedOpenings);
                } else {
                    console.log("No opening found with the provided sequence:", openingSeq);
                }
            } catch (error) {
                console.error("Error deleting opening from Firestore and localStorage:", error);
            } finally {
                resolve();  // Release the lock when done
            }
        });
    };

    const deleteOpening = async () => {
        try {
            const oldOpeningString = arrayToString(jsonArray);
            await deleteOpeningBySeq(oldOpeningString);
            alert("Successfully removed opening from database");
        } catch (Error) {
            alert("Failed to remove opening")
        }
    }
    const terminateOpening = async () => {
        try {
            if (userMoveCount !== 0) {
                throw new Error();
            }
            const oldOpeningString = arrayToString(jsonArray);
            await deleteOpeningBySeq(oldOpeningString);
            await BranchToFirebase(oldOpeningString, true);   
            setIsTerminateClicked(true);   
            setIsBranchClicked(true);  
        } catch (Error) {
            alert("Do not move before branching");
        }
    }
    const branchOpenings = async () => {
        try {
            if (userMoveCount !== 1 ) {
                throw new Error("Failed to branch opening. You must make exactly 1 move before you add an opening");
            }
            if  ((solverArray[0] >= 0 && solverArray[0] !== 100) || 
            (solverArray[1] >= 0 && solverArray[1] !== 100) || (solverArray[2] >= 0 && solverArray[2] !== 100) ||
            (solverArray[3] >= 0 && solverArray[3] !== 100) || (solverArray[4] >= 0 && solverArray[4] !== 100) ||
            (solverArray[5] >= 0 && solverArray[5] !== 100) || (solverArray[6] >= 0 && solverArray[6] !== 100)) {
                throw new Error("Failed to add opening. Make sure you select a winning move");
            }
    
            // Create new openings
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
    
            // Branch to Firebase
            await BranchToFirebase(y1, false);
            await BranchToFirebase(y2, false);
            await BranchToFirebase(y3, false);
            await BranchToFirebase(y4, false);
            await BranchToFirebase(y5, false);
            await BranchToFirebase(y6, false);
            await BranchToFirebase(y7, false);
    
            console.log(jsonArray, "This is the json Array");
    
            // Find the previous opening sequence to terminate
            const oldOpeningString = arrayToString(jsonArray.slice(0, -1));
            await deleteOpeningBySeq(oldOpeningString);
            setIsBranchClicked(true);  
            setIsTerminateClicked(true);
            alert("Opening added successfully!");
        } catch (Error) {
            alert(Error.message);
        }
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
            if (moveCounter < openingArray.length && moveCounter % 2 === 1) {
                await new Promise(resolve => {
                    setTimeout(() => {
                        dropPiece(openingArray[moveCounter] - 1);
                        resolve();
                    }, 600); // 1000ms delay for each move
                });
            } else if (moveCounter >= openingArray.length && isCorrect) {
                alert("Success!");
            } else if (!isCorrect) {
                alert("You made an incorrect move")
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
    }, [newJSON]);

    const syncLocalStorageToFirebaseData = async () => {
        try {
          // Step 1: Clear Local Storage
          localStorage.clear();
          console.log("Local Storage has been cleared.");
      
          // Step 2: Fetch Data from Firebase
          const openingsCollectionRef = collection(db, "openings");  // Replace with your collection reference
          const querySnapshot = await getDocs(openingsCollectionRef);
          
          // Step 3: Store Firebase Data in Local Storage
          const firebaseData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Store the fetched data in Local Storage
          localStorage.setItem("openings", JSON.stringify(firebaseData));
          console.log("Local Storage has been updated with data from Firebase.");
      
        } catch (error) {
          console.error("Error syncing Local Storage with Firebase:", error);
        }
      };
      
    
      const getOpenings = async () => {
        const cachedOpenings = localStorage.getItem('openings');
    
        const weightedRandomSelect = (openings) => {
            // Calculate total weight
            const totalWeight = openings.reduce((sum, opening) => sum + opening.weight, 0);
    
            // Generate a random number between 0 and totalWeight
            let randomNum = Math.random() * totalWeight;
    
            // Select an opening based on weight
            for (const opening of openings) {
                randomNum -= opening.weight;
                if (randomNum <= 0) {
                    return opening;
                }
            }
        };
    
        if (cachedOpenings) {
            console.log('Using cached openings');
            const parsedOpenings = JSON.parse(cachedOpenings);
            setOpenings(parsedOpenings);
    
            // Filter valid openings from cached data
            const validOpenings = parsedOpenings.filter(opening => opening.terminate);
            if (validOpenings.length > 0) {
                const selectedOpening = weightedRandomSelect(validOpenings);
                setOpeningArray(decodeOpening(selectedOpening.openingSeq));
            }
        } else {
            // Fetch from Firebase if not available in cache
            try {
                console.log('Fetching openings from Firebase');
                const data = await getDocs(openingsCollectionRef);
                const fetchedOpenings = data.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOpenings(fetchedOpenings);
    
                // Save to localStorage
                localStorage.setItem('openings', JSON.stringify(fetchedOpenings));
    
                // Filter valid openings
                const validOpenings = fetchedOpenings.filter(opening => opening.terminate);
                if (validOpenings.length > 0) {
                    const selectedOpening = weightedRandomSelect(validOpenings);
                    setOpeningArray(decodeOpening(selectedOpening.openingSeq));
                }
            } catch (error) {
                console.error("Error fetching openings:", error);
            }
        }
    };
    

    useEffect(() => {    
        getOpenings();
    }, [gameCount]);

    useEffect(() => {
        syncLocalStorageToFirebaseData();  // Correct way to call the function
    }, []);
    
    
    useEffect(() => {
        console.log(openingArray);
        playInitialMoves();
        console.log("JSON Sequence being played", newJSON);
    }, [openingPermision]); 



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
<div className="solver-output">
        <div className="solver-row">
            {solverArray.map((num, index) => (
                <div key={index} className="solver-column">
                    {num}
                </div>
            ))}
        </div>
    </div>


<div className="databaseButtons">
    <div className="greenButton">
        <button className="button" onClick={deleteOpening} disabled = {isTerminateClicked}>Remove Opening</button>
    </div>
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

export default TrainOpenings;
