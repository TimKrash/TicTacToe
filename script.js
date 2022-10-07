class Game {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.board = [["", "", ""], ["", "", ""], ["", "", ""]];
    this.currentTurn = p1;
    this.winner = null;
  }

  markSquare = (move, marker) => {
    let row = move[0];
    let col = move[1];
    if (this.isEmptySquare(move)) {
      displayController.addMove(move, this.currentTurn.marker);
      this.board[row][col] = marker;
      this.switchTurn();
    }
  }

  isEmptySquare = (move) => {
    let row = move[0];
    let col = move[1];
    return this.board[row][col] === "";
  }

  emptySquares = () => {
    let emptySquareList = [];
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        if (this.board[i][j] === "") {
          emptySquareList.push([i,j]);
        }
      }
    }

    return emptySquareList;
  }

  getCurrentTurn = () => this.currentTurn;

  switchTurn = () => {
    if (this.currentTurn === this.p1) {
      this.currentTurn = this.p2
    } else {
      this.currentTurn = this.p1;
    }

    if (this.currentTurn.type === "Computer") {
      displayController.handleAIMove();
    }
  }

  gameOver = () => {
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i][0] === this.board[i][1] 
        && this.board[i][0] === this.board[i][2]
        && this.board[i][0] !== "") {
          this.winner = this.board[i][0];
          return true;
        }
    }

    for (let i = 0; i < this.board.length; i++) {
      if (this.board[0][i] === this.board[1][i] 
        && this.board[0][i] === this.board[2][i]
        && this.board[0][i] !== "") {
          this.winner = this.board[0][i];
          return true;
        }
    }

    if (this.board[0][0] === this.board[1][1]
      && this.board[0][0] === this.board[2][2]
      && this.board[0][0] !== "") {
        this.winner = this.board[0][0];
        return true;
      }

    if (this.board[0][2] === this.board[1][1]
      && this.board[0][2] === this.board[2][0]
      && this.board[0][2] !== "") {
        this.winner = this.board[0][2];
        return true;
      }

    this.winner = null;
    return false;
  }

  getWinner = () => {
    if (this.p1.marker === this.winner) {
      return this.p1;
    } else if (this.p2.marker === this.winner) {
      return this.p2;
    } else {
      return null;
    }
  }
}

class Player {
  constructor(name, marker, type) { 
    this.name = name;
    this.marker = marker;
    this.type = type;
   }

   move = (game, m) => {
    game.markSquare(m, this.marker);
   }
}

class AI extends Player {
  constructor(name, marker, type) {
    super(name, marker, type);
    this.oppMarker = (marker === "x") ? "o" : "x";
  }

  getScore = (game) => {
    if (!game.getWinner()) {
      return 0;
    }

    if (game.getWinner().marker === this.marker) {
      return 10;
    } else if (game.getWinner().marker === this.oppMarker) {
      return -10;
    }
  }

  minimax = (game, maxPlayer, lastMove) => {
    if (game.gameOver() || game.emptySquares().length === 0) {
      return [lastMove, this.getScore(game)];
    }

    if (maxPlayer) {
      let maxEval = -1000;
      let bestMove = null;
      for (const m of game.emptySquares()) {
        let row = m[0];
        let col = m[1];

        game.board[row][col] = this.marker;

        let currEval = this.minimax(game, !maxPlayer, m);
        game.board[row][col] = "";
        if (currEval[1] > maxEval) {
          maxEval = currEval[1];
          bestMove = m;
        }
      }
      return [bestMove, maxEval];
    } else {
      let minEval = 1000;
      let bestMove = null;
      for (const m of game.emptySquares()) {
        let row = m[0];
        let col = m[1];

        game.board[row][col] = this.oppMarker;

        let currEval = this.minimax(game, !maxPlayer, m);
        game.board[row][col] = "";
        if (currEval[1] < minEval) {
          minEval = currEval[1];
          bestMove = m;
        }
      }
      return [bestMove, minEval];
    }
  }

  moveBest = (game) => {
    let res = this.minimax(game, 1, [-1, -1]);
    game.markSquare(res[0], this.marker);
  }
}

class DisplayController {
  constructor() {
    this.formElem = document.querySelector("form");
    this.playElem = document.querySelector(".play");
    this.squareElem = document.querySelectorAll(".square");
    this.startContainerElem = document.querySelector(".start-container");
    this.boardElem = document.querySelector(".board");
    this.gameOverElem = document.querySelector(".game-over");
    this.winnerElem = document.querySelector(".winner");
    this.playAgainElem = document.querySelector(".play-again");

    this.squareElem.forEach(square => {
      square.addEventListener('click', this.handleHumanMove);
    })
    this.formElem.addEventListener('submit', this.handleFormSubmit);
    this.playAgainElem.addEventListener('click', () => window.location.reload());
  }

  addMove = (target, marker) => {
    let square = document.querySelector(`div[id="${target[0]}-${target[1]}"]`);
    square.textContent = marker;
  }

  isGameOver = () => {
    if (this.game.gameOver() || this.game.emptySquares().length === 0) {
      this.boardElem.style.display = "none";

      let winner = this.game.getWinner();
      if (winner) {
        this.winnerElem.textContent = `Game over! ${winner.name} won!`
        this.gameOverElem.style.display = "flex";
      } else {
        this.winnerElem.textContent = `Game over! It's a draw!`
        this.gameOverElem.style.display = "flex";
      }
      return true;
    }

    return false;
  }

  handleHumanMove = async (e) => {
    let target = e.target;
    let squareId = target.id;
    squareId = squareId.split("-");

    let row = parseInt(squareId[0]);
    let col = parseInt(squareId[1]);
    let move = [row, col];
    let currentPlayer = this.game.getCurrentTurn();

    if (currentPlayer.type === "Human" 
    && this.game.isEmptySquare(move)) {
      currentPlayer.move(this.game, move);
    }

    await new Promise(r => setTimeout(r, 1000));
    if (this.isGameOver()) {
      return;
    }
  }

  handleAIMove = async (m) => {
    await new Promise(r => setTimeout(r, 1000));
    if (this.isGameOver()) {
      return;
    }

    let currentPlayer = this.game.getCurrentTurn();
    /*
    let randomRow = this.randomIntGen(0,2);
    let randomCol = this.randomIntGen(0,2);
    let move = [randomRow, randomCol];

    while (!this.game.isEmptySquare(move)) {
      move = [this.randomIntGen(0,2), this.randomIntGen(0,2)];
    }
    */

    // DOM target
    currentPlayer.moveBest(this.game);
  }

  randomIntGen = (start, end) => {
    return Math.floor(Math.random() * (end - start + 1) + start);
  }

  handleFormSubmit = (e) => {
    let target = e.target;
    let formData = new FormData(target);

    let formProps = Object.fromEntries(formData);
    let p1 = new Player(formProps.p1name, "x", formProps.type1);
    let p2 = new AI(formProps.p2name, "o", formProps.type2);

    this.game = new Game(p1, p2);

    // Display board and hide start screen
    this.startContainerElem.style.display = "none";
    this.boardElem.style.display = "grid";

    if (p1.type === "Computer") {
      this.handleAIMove();
    }
  }
}

let displayController = new DisplayController();