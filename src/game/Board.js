import React, { useState, useCallback, useEffect } from "react";
import "./Board.css";

function Slot(props) {
    // const [color, setColor] = useState(0);
    // const [locked, setLocked] = useState(false);

    const getInnerClassNames = () => {
        let team = "";
        if (Math.abs(props.value) === 1) {
            team = "red";
        } else if (Math.abs(props.value) === 2) {
            team = "yellow";
        }
        return "slot-inner " + team + (props.value < 0 ? " preview" : "");
    };

    return (
        <div className="slot">
            <div className={getInnerClassNames()}></div>
        </div>
    );
}

function Column(props) {
    return (
        <div
            className="column"
            onClick={() => props.onClick(props.id)}
            onMouseEnter={() => props.onMouseOver(props.id)}
            onMouseLeave={() => props.onMouseLeave(props.id)}
        >
            <Slot id="5" value={props.values[5]}></Slot>
            <Slot id="4" value={props.values[4]}></Slot>
            <Slot id="3" value={props.values[3]}></Slot>
            <Slot id="2" value={props.values[2]}></Slot>
            <Slot id="1" value={props.values[1]}></Slot>
            <Slot id="0" value={props.values[0]}></Slot>
        </div>
    );
}

// board.length == num columns, board[0].length == num rows
const getInitialBoard = () => {
    return [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
};

const initialTimeMs = 30 * 1000;

function Board(props) {
    const [started, setStarted] = useState(false);
    const [board, setBoard] = useState(getInitialBoard());
    const [player, setPlayer] = useState(1);

    const [timer, setTimer] = useState(20 * 1000);
    const [timerId, setTimerId] = useState(0);

    const [speed, setSpeed] = useState(10);
    const [activeCol, setActiveCol] = useState(3);

    // 0: ongoing, 1: player 1 won, 2: player 2 won, -1: tie
    const [wonStatus, setWonStatus] = useState(0);
    const [gameOverText, setGameOverText] = useState("");

    useEffect(() => {
        if (!started || wonStatus != 0) return;

        if (speed >= 0) {
            const timerId = setTimeout(() => {
                setTimer(timer - 1);
            }, 1);
            setTimerId(timerId);

            if (timer == 0) {
                onColClick(activeCol);
            }
        }
        // else {
        //     setTimer(0);
        //     const timerId = setTimeout(() => {
        //         setTimer(timer - 1);
        //     }, 1000);
        //     setTimerId(timerId);
        // }

        // return () => {
        //     clearTimeout(timerId);
        // };
    }, [timer, speed, started, wonStatus]);

    useEffect(() => {
        if (!started) {
            setTimer(initialTimeMs - speed * 1000);
        }
    }, [speed, started]);

    useEffect(() => {
        if (!started) return;
        // console.log("col " + colId + " hovered");
        let previewFound = false;
        const newBoard = [...board];
        while (!previewFound) {
            for (let i = 0; i < newBoard[activeCol].length; i++) {
                if (newBoard[activeCol][i] === 0) {
                    // console.log("chip previewed");
                    newBoard[activeCol][i] = -player;
                    previewFound = true;
                    break;
                }
            }
        }
        setBoard(newBoard);
    }, [activeCol]);

    useEffect(() => {
        if (wonStatus === 0) return;

        let newGameOverText = "";
        if (wonStatus === -1) {
            newGameOverText = "Tie Game!";
        } else if (wonStatus === 1) {
            newGameOverText = "Player 1 Wins!";
        } else if (wonStatus === 2) {
            newGameOverText = "Player 2 Wins!";
        }

        setGameOverText(newGameOverText);
        clearTimeout(timerId);
    }, [wonStatus]);

    const switchPlayer = () => {
        if (player === 1) {
            setPlayer(2);
        } else {
            setPlayer(1);
        }
    };

    const reset = () => {
        // console.log("restarting game");
        setStarted(false);
        setBoard(getInitialBoard());
        setPlayer(1);
        setWonStatus(0);
        setTimer(initialTimeMs - speed * 1000);
        setActiveCol(3);
    };

    const checkWin = (colId, rowId) => {
        const minCol = Math.max(0, colId - 4);
        const maxCol = Math.min(board.length, colId + 4);
        const minRow = Math.max(0, rowId - 4);
        const maxRow = Math.min(board[0].length, rowId + 4);

        let winning = [];

        // console.log("Col: " + maxCol, minCol);
        // console.log("Row: " + maxRow, minRow);

        let count = 0;

        // Check horizontal win
        for (let i = minCol; i < maxCol; i++) {
            if (board[i][rowId] === player) {
                count++;
                if (count === 4) {
                    setWonStatus(player);
                    return true;
                }
            } else {
                count = 0;
            }
        }

        // Check vertical win
        count = 0;
        for (let i = minRow; i < maxRow; i++) {
            if (board[colId][i] === player) {
                count++;
                if (count === 4) {
                    setWonStatus(player);
                    return true;
                }
            } else {
                count = 0;
            }
        }

        // Check / win
        count = 0;
        // console.log("check / win");
        let minDelta = Math.max(-3, -colId, -rowId);
        let maxDelta = Math.min(5, 7 - colId, 6 - rowId);
        for (let i = minDelta; i < maxDelta; i++) {
            // console.log("setting " + (colId + i) + " " + (rowId + i));
            if (board[colId + i][rowId + i] === player) {
                count++;
                if (count === 4) {
                    setWonStatus(player);
                    return true;
                }
            } else {
                count = 0;
            }
        }

        // Check \ win
        // console.log("check \\ win");
        count = 0;
        minDelta = Math.max(-3, -colId, rowId - 6);
        maxDelta = Math.min(5, 7 - colId, 1 + rowId);
        for (let i = minDelta; i < maxDelta; i++) {
            // console.log("setting " + (colId + i) + " " + (rowId - i));
            if (board[colId + i][rowId - i] === player) {
                count++;
                // console.log("player chip found");
                if (count === 4) {
                    setWonStatus(player);
                    return true;
                }
            } else {
                count = 0;
            }
        }

        // If no direction is a win, return false
        return false;
    };

    const onColClick = (colId) => {
        // Only place a new chip if game is not over
        if (wonStatus != 0) return;

        if (!started) {
            setStarted(true);
        }

        // console.log("col " + colId + " clicked");
        const newBoard = [...board];
        for (let i = 0; i < newBoard[colId].length; i++) {
            if (newBoard[colId][i] <= 0) {
                console.log("chip placed");
                const temp = newBoard[colId][i];
                newBoard[colId][i] = player;
                if (!checkWin(parseInt(colId), i) && !checkTie()) {
                    // Adjust preview location
                    if (i + 1 < newBoard[colId].length) {
                        newBoard[colId][i + 1] = temp == -1 ? -2 : -1;
                    }
                    switchPlayer();
                }
                setTimer(initialTimeMs - speed * 1000);
                break;
            }
        }
        setBoard(newBoard);
    };

    const onHover = (colId) => {
        // Only place a new chip if game is not over
        if (wonStatus != 0) return;

        if (!started) {
            setStarted(true);
        }

        setActiveCol(colId);
        // console.log("col " + colId + " hovered");
        // const newBoard = [...board];
        // for (let i = 0; i < newBoard[colId].length; i++) {
        //     if (newBoard[colId][i] === 0) {
        //         // console.log("chip previewed");
        //         newBoard[colId][i] = -player;
        //         setActiveCol(colId);
        //         break;
        //     }
        // }
        // setBoard(newBoard);
    };

    const onLeave = (colId) => {
        // Only place a new chip if game is not over
        if (wonStatus != 0) return;
        // console.log("col " + colId + " off hovered");
        const newBoard = [...board];
        for (let i = 0; i < newBoard[colId].length; i++) {
            if (newBoard[colId][i] < 0) {
                // console.log("chip previewed");
                newBoard[colId][i] = 0;
                break;
            }
        }
        setBoard(newBoard);
    };

    const checkTie = () => {
        if (wonStatus != 0) return;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                if (board[i][j] == 0) return false;
            }
        }
        setWonStatus(-1);
        return true;
    };

    return (
        <div className="game-container">
            <div>
                <div className="board">
                    {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                        <Column
                            key={idx}
                            id={idx}
                            // id={"col-" + idx}
                            values={board[idx]}
                            onClick={onColClick}
                            onMouseOver={onHover}
                            onMouseLeave={onLeave}
                        ></Column>
                    ))}
                </div>
                <div className="board-footer">
                    {wonStatus === 0 ? (
                        <div id="playerIndicator" className="player-indicator">
                            Player {player}
                        </div>
                    ) : (
                        <div id="gameOver">{gameOverText}</div>
                    )}
                    {speed >= 0 && (
                        <div className="timer">
                            {new Date(timer).toISOString().substr(17, 5)}
                        </div>
                    )}
                    <button className="restartButton" onClick={reset}>
                        Restart?
                    </button>
                </div>
            </div>
            <div className="speed-options">
                <label>Speed: {speed} </label>
                <input
                    className="slider"
                    id="speed"
                    type="range"
                    value={speed}
                    min="-1"
                    max="25"
                    // disabled={wonStatus == 0}
                    onChange={(evt) => {
                        setSpeed(evt.target.value);
                    }}
                ></input>
                <div className="labels">
                    <div>untimed</div>
                    <div>super fast</div>
                </div>
            </div>
        </div>
    );
}

export default Board;
