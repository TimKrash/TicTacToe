const player = (marker) => {

  const getMarker = () => marker;

  const mark = (row, col) => {
    if (gameController.isValidMove(row, col)) {
      gameBoard.setSquare(row, col, marker);
    }
  }

  return { getMarker, mark }
}

const gameController = (() => {
  let currKey = true;
  let markerMap = {true: 'x', false: 'o'};
  let playerOneMarker = markerMap[currKey];
  let playerTwoMarker = markerMap[!currKey];

  let playerOne = player(playerOneMarker);
  let playerTwo = player(playerTwoMarker);

  let playerMap = {};
  playerMap[playerOneMarker] = playerOne;
  playerMap[playerTwoMarker] = playerTwo;

  const setUserMarker = (marker) => currKey = marker;
  const switchCurrMarker = () => currKey = !currKey;

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
    let prevTurnUser = playerMap[markerMap[!currKey]];
    let prevTurnMarker = prevTurnUser.getMarker();

    if (board[row].every(x => x === prevTurnMarker)) {
      console.log("Row wins!");
      return true;
    }

    for (let i = 0; i < board.length; i++) {
      if (board[i][col] == prevTurnMarker && i != board.length - 1) {
        continue
      } else if (board[i][col] == prevTurnMarker) {
        console.log("Col wins!");
        return true;
      }
      break;
    }

    if (onDiag(row, col, prevTurnMarker)) {
      console.log("Diag wins!");
      return true;
    }

    return false;
  }

  const isValidMove = (row, col) => {
    if (gameBoard.getSquare(row, col) == "") {

      // Switch user turn now
      switchCurrMarker();
      return true;
    }
    return false;
  };

  const getCurrTurn = () => playerMap[markerMap[currKey]];

  return {
    isValidMove, setUserMarker, getCurrTurn, isGameOver
  };

})()

const displayController = (() => {
  const handleUserClick = (e) => {
    let target = e.target;
    let rowColArr = target.id.split("-");
    let row = parseInt(rowColArr[0]);
    let col = parseInt(rowColArr[1]);

    let currUser = gameController.getCurrTurn();
    let userMarker = currUser.getMarker();
    currUser.mark(row, col);
    if (gameBoard.getSquare(row, col) == userMarker) {
      target.textContent = userMarker;
    }

    if (gameController.isGameOver(row, col)) {
      console.log("Game over! Winner is " + userMarker);
    }
  }

  let squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    square.addEventListener('click', handleUserClick);
  });
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
