const player = (name, marker, type) => {
  const getMarker = () => marker;
  const getType = () => type;
  const getName = () => name;

  const mark = (row, col) => {
    if (gameController.isValidMove(row, col)) {
      gameBoard.setSquare(row, col, marker);
    }
  }

  return { getMarker, mark, getType, getName }
}

const gameController = (() => {
  let players = [];
  let currTurn;

  const createPlayer = (name, marker, type) => {
    players.push(player(name, marker, type));
    currTurn = players[0];
  }
  const getPlayers = () => players;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const switchTurn = async () => {
    prevTurn = currTurn;

    if (currTurn === players[0]) {
      currTurn = players[1];
    } else {
      currTurn = players[0];
    }

    if (currTurn.getType() === "Computer") {
      await sleep(200);
      handleComputerMove(currTurn);
    }
  }

  const checkDiag = (diagArr, marker) => {
    let board = gameBoard.getBoard();
     for (let i = 0; i < diagArr.length; i++) {
        let elem = diagArr[i];
        let boardVal = board[elem[0]][elem[1]];
        if (boardVal == marker && i != diagArr.length - 1) {
          continue;
        } else if (boardVal == marker) {
          return true;
        }
        return false;
      }
  }

  const onDiag = (row, col, marker) => {
    let diagSetForward = new Set();
    diagSetForward.add([0,0]).add([1,1]).add([2,2]);

    let diagSetBackward = new Set();
    diagSetBackward.add([0,2]).add([1,1]).add([2,0]);

    let forwardDiag = Array.from(diagSetForward);
    if (checkDiag(forwardDiag, marker)) {
      return true;
    }

    let backwardDiag = Array.from(diagSetBackward);
    if (checkDiag(backwardDiag, marker)) {
      return true;
    }

    return false;
  }

  // End game logic
  const isGameOver = (row, col) => {
    let board = gameBoard.getBoard();
    let currTurnMarker = currTurn.getMarker();

    if (board[row].every(x => x === currTurnMarker)) {
      return true;
    }

    for (let i = 0; i < board.length; i++) {
      if (board[i][col] == currTurnMarker && i != board.length - 1) {
        continue
      } else if (board[i][col] == currTurnMarker) {
        return true;
      }
      break;
    }

    if (onDiag(row, col, currTurnMarker)) {
      return true;
    }

    return false;
  }

  const isValidMove = (row, col) => {
    if (gameBoard.getSquare(row, col) == "") {
      return true;
    }
    return false;
  };

  const getCurrTurn = () => currTurn;

  const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const handleComputerMove = (currUser) => {
    let row = getRandomInt(0,2);
    let col = getRandomInt(0,2);

    while (!isValidMove(row, col)) {
      row = getRandomInt(0,2);
      col = getRandomInt(0,2);
    }

    currUser.mark(row, col);
    displayController.addComputerMove(currUser, row, col);
  }

  return {
    isValidMove, getCurrTurn, isGameOver, createPlayer, getPlayers, switchTurn, sleep
  };

})()

const displayController = (() => {
  let playerOne;
  let playerTwo;
  let startContainer = document.querySelector(".start-container");
  let board = document.querySelector(".board");

  const handleNewMove = async (currUser, target, row, col) => {
    let userMarker = currUser.getMarker();
    currUser.mark(row, col);
    if (gameBoard.getSquare(row, col) == userMarker) {
      target.textContent = userMarker;

      if (gameController.isGameOver(row, col)) {
        await gameController.sleep(200);
        let gameOver = document.querySelector(".game-over");
        let winner = gameOver.querySelector(".winner");
        let playAgain = gameOver.querySelector("button");
        playAgain.addEventListener('click', (e) => {
          window.location.reload();
        });

        board.style.display = "none";

        winner.textContent = "Game Over! " + currUser.getName() + " won!";
        gameOver.style.display = "flex";
      } else {
        gameController.switchTurn();
      }
    }
  }

  const addComputerMove = (currUser, row, col) => {
    let target = document.querySelector(`div[id="${row}-${col}"]`);
    handleNewMove(currUser, target, row, col);
  }

  const handleStartPlay = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    // todo handle x vs o
    gameController.createPlayer(formProps.p1name, "x", formProps.type1);
    gameController.createPlayer(formProps.p2name, "o", formProps.type2);

    [playerOne, playerTwo] = gameController.getPlayers();

    startContainer.style.display = "none";
    board.style.display = "grid";
  }

  const handleUserMove = (e) => {
    let target = e.target;
    let rowColArr = target.id.split("-");
    let row = parseInt(rowColArr[0]);
    let col = parseInt(rowColArr[1]);

    let currUser = gameController.getCurrTurn();
    if (currUser.getType() !== "Human") {
      return;
    }

    handleNewMove(currUser, target, row, col);
  }

  let squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    square.addEventListener('click', handleUserMove);
  });

  let form = document.querySelector("form");
  form.addEventListener('submit', handleStartPlay);

  return { addComputerMove  }
})()

const gameBoard = (() => {
  let board = [["","",""], ["","",""], ["","",""]]

  const getBoard = () => board;
  const getSquare = (row, col) => board[row][col];
  const setSquare = (row, col, marker) => {
    board[row][col] = marker;
  }

  return {
    getSquare, setSquare, getBoard
  }
})()
