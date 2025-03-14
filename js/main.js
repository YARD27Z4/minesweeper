'use strict'

const MINE = '💣';
const FLAG = '🚩';
const NORMAL = '😊';
const LOSE = '😑';
const WIN = '😍';

var gBoard;
var firstClick = true;
var gLevel = { 
  SIZE: 4,   // גודל ברירת מחדל של הלוח
  MINES: 2   // מספר מוקשים בברירת מחדל
};

var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
  hintsLeft: 3, 
  isHintActive: false
};

// אתחול המשחק
function onInitGame() {
  gBoard = buildBoard(); // בניית הלוח
  renderBoard(gBoard); // הצגת הלוח
  document.getElementById('hintsLeft').innerText = 'Hints Left: ' + gGame.hintsLeft;
  document.querySelector('.board').addEventListener('contextmenu', onCellRightClick);
}

// פונקציה לבניית הלוח
function buildBoard() {
  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board.push([]);
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i].push({
        minesAroundCount: 0,
        isCovered: true,
        isMine: false,
        isMarked: false,
        isShown: false
      });
    }
  }
  return board;
}

// מיקום מוקשים על הלוח תוך הימנעות מהקליק הראשון של השחקן
function setMinesOnBoard(firstI, firstJ) {
  var minesCount = gLevel.MINES;
  var availablePositions = [];

  // יצירת מערך עם כל המיקומים האפשריים להנחת מוקשים
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (i !== firstI || j !== firstJ) {
        availablePositions.push({ i: i, j: j });
      }
    }
  }

  // הנחת המוקשים באופן אקראי
  while (minesCount > 0 && availablePositions.length > 0) {
    var randomIndex = Math.floor(Math.random() * availablePositions.length);
    var position = availablePositions.splice(randomIndex, 1)[0];
    gBoard[position.i][position.j].isMine = true;
    updateNeighboringCells(gBoard, position.i, position.j);
    minesCount--;
  }
}

// הצגת הלוח על המסך
function renderBoard(board) {
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      strHTML += `<td class="cell covered cell-${i}-${j}"
                    data-i="${i}" data-j="${j}"
                    onclick="onCellClicked(this, ${i}, ${j})">
                  </td>`;
    }
    strHTML += '</tr>';
  }
  document.querySelector('.board').innerHTML = strHTML;
}

// אירוע לחיצה על תא בלוח
function onCellClicked(elCell, i, j) {
  if (firstClick) {
    setMinesOnBoard(i, j);
    firstClick = false;
  }
  
  var currCell = gBoard[i][j];
  if (currCell.isMarked || currCell.isShown) return;

  if (currCell.isMine) {
    gGame.lives--;
    document.getElementById('lives').innerText = 'Lives: ' + gGame.lives;
    if (gGame.lives === 0) {
      alert('Game Over!');
      revealAllMines();
      return;
    } else {
      alert('Boom! You lost a life. Lives left: ' + gGame.lives);
    }
  } else {
    currCell.isShown = true;
    elCell.classList.remove('covered');
    elCell.innerText = currCell.minesAroundCount || ''; // אם 0 - הצג משבצת ריקה
    if (currCell.minesAroundCount === 0) {
      expandReveal(gBoard, i, j);
    }
    checkGameOver();
  }
}

// הרחבת החשיפה לתאים שכנים אם אין מוקשים מסביב
function expandReveal(board, i, j) {
  for (var x = i - 1; x <= i + 1; x++) {
    for (var y = j - 1; y <= j + 1; y++) {
      if (x >= 0 && x < gLevel.SIZE && y >= 0 && y < gLevel.SIZE) {
        var neighbor = board[x][y];
        if (!neighbor.isShown && !neighbor.isMine) {
          neighbor.isShown = true;
          var elNeighbor = document.querySelector(`.cell-${x}-${y}`);
          elNeighbor.classList.remove('covered');
          elNeighbor.innerText = neighbor.minesAroundCount || ''; // אם 0 - הצג משבצת ריקה
          if (neighbor.minesAroundCount === 0) expandReveal(board, x, y);
        }
      }
    }
  }
}

// עדכון ספירת מוקשים עבור תאים שכנים
function updateNeighboringCells(board, i, j) {
  for (var x = i - 1; x <= i + 1; x++) {
    for (var y = j - 1; y <= j + 1; y++) {
      if (x >= 0 && x < gLevel.SIZE && y >= 0 && y < gLevel.SIZE && !(x === i && y === j)) {
        board[x][y].minesAroundCount++;
      }
    }
  }
}

// הצגת כל המוקשים במקרה של הפסד
function revealAllMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) {
        var elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.innerText = MINE;
        elCell.classList.add('mine-revealed');
      }
    }
  }
}

// בדיקת מצב הניצחון
function checkGameOver() {
  var revealedCount = 0;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isShown) revealedCount++;
    }
  }
  if (revealedCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
    alert('You Win!');
  }
}
