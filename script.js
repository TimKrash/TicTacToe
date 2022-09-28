const gameController = (() => {
  let currMarker = "x";

  const getCurrMarker = () => currMarker;
  const switchMarker = () => (currMarker == "x") ? currMarker = "o" : currMarker = "x";

  const isValidMove = (row, col) => {
    if (gameBoard.getSquare(row, col) == "") {
      gameBoard.setSquare(row, col, currMarker);
      switchMarker();
      return true;
    }

    return false;
  }

  return {
    getCurrMarker, switchMarker, isValidMove
  };
})()

const displayController = (() => {
  const handleUserClick = (e) => {
    let target = e.target;
    let rowColArr = target.id.split("-");
    let row = parseInt(rowColArr[0]);
    let col = parseInt(rowColArr[1]);

    if (gameController.isValidMove(row, col)) {
      let currMarker = gameController.getCurrMarker();
      target.textContent = currMarker;
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

const player = () => {
}
