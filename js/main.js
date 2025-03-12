'use strict'
const MINE = '💣'
const FLAG = '🚩'
const NORMAL = '😊'
const LOSE = '😑'
const WIN = '😍'

var firstClick = true
var gBoard
var gLevel = { 
  SIZE: 4,
  MINES: 2
}

var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
}

function onInitGame() {
  gBoard = buildBoard()
  setMinesOnBoard()
  renderBoard(gBoard)
}

function setMinesOnBoard() {
  var minesCount = gLevel.MINES
  var availablePositions = []

  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      availablePositions.push({ i: i, j: j })
    }
  }


  while (minesCount > 0) {
    var randomIndex = getRandomInt(0, availablePositions.length)
    var position = availablePositions[randomIndex]

    gBoard[position.i][position.j].isMine = true
    minesCount--;

    if (firstClick && !gBoard[position.i][position.j].isShown) {
      availablePositions.splice(randomIndex, 1)
      continue;
    }

    updateNeighboringCells(gBoard, position.i, position.j)
    console.table(gBoard)
    availablePositions.splice(randomIndex, 1)
  }
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isCovered: true,
        isMine: false,
        isMarked: false,
        isShown: false
      }
      board[i].push(cell)
    }
  }
  return board
}

function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j]
      var cellContent = ''

      if (cell.isMine) {
        cellContent = MINE
      } else if (cell.minesAroundCount > 0) {
        cellContent = cell.minesAroundCount
      } else {
        cellContent = ''  
      }

      var className = ''
      var content = cellContent

      if (cell.isCovered) {
        className = 'covered'
        content = '' 
      } else if (cell.isMine) {
        className = 'mine'
        content = MINE
      } else if (cell.isMarked) {
        className = 'flag'
        content = FLAG
      }

strHTML += `<td class="cell ${className} cell-${i}-${j}"
                data-i="${i}" data-j="${j}"
                onclick="onCellClicked(this,${i},${j})">
                 ${content} 
              </td>`
    }
    strHTML += '</tr>'
  }
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
  var cell = gBoard[i][j];

  if (cell.isMine) {
      handleMineClick(elCell, i, j)
      return;
  }

  cell.isShown = true;
  elCell.classList.add('revealed')

  if (cell.minesAroundCount === 0) {
      elCell.innerText = ''
      expandReveal(gBoard, i, j)
  } else {
    elCell.innerText = cell.minesAroundCount === 0 ? '' : cell.minesAroundCount

  }

  checkGameOver(gBoard);
}



function updateNeighboringCells(board, i, j) {
  for (var x = i - 1; x <= i + 1; x++) {
    for (var y = j - 1; y <= j + 1; y++) {
      if (x >= 0 && x < gLevel.SIZE && y >= 0 && y < gLevel.SIZE) {
        if (!board[x][y].isMine) {
          board[x][y].minesAroundCount++
        }
      }
    }
  }
}

function onCellClicked(elCell, i, j) {
  if (firstClick) {
    while (gBoard[i][j].isMine) {
      const randomI = getRandomInt(0, gLevel.SIZE)
      const randomJ = getRandomInt(0, gLevel.SIZE)
      i = randomI
      j = randomJ
      if (!gBoard[i][j].isMine) break
    }
    firstClick = false; 
  }

  var currCell = gBoard[i][j];
  if (currCell.isMine) {
    gGame.lives--
    document.getElementById('lives').innerText = 'Lives: ' + gGame.lives;
    
    if (gGame.lives === 0) {
      alert('Game Over!')
      revealAllMines()
    } else {
      alert('Boom! You lost a life. Lives left: ' + gGame.lives);
    }
  } else {
    expandReveal(gBoard, elCell, i, j)
  }

  checkGameOver(gBoard)
}



function revealAllMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var currCell = gBoard[i][j];
      if (currCell.isMine) {
        const elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.innerText = MINE;
        elCell.classList.add('mine-revealed');
      }
    }
  }
}


function expandReveal(board, elCell, i, j) {
  var currCell = board[i][j]
  if (!currCell.isShown) {
    currCell.isShown = true
    elCell.innerText = currCell.minesAroundCount
    elCell.classList.add('revealed')

    if (currCell.minesAroundCount === 0) {
      for (var x = i - 1; x <= i + 1; x++) {
        for (var y = j - 1; y <= j + 1; y++) {
          if (x >= 0 && x < gLevel.SIZE && y >= 0 && y < gLevel.SIZE) {
            const nextCell = document.querySelector(`.cell-${x}-${y}`)
            expandReveal(board, nextCell, x, y)
          }
        }
      }
    }
  }
}

function checkGameOver(board) {
  var isGameOver = true
  var totalCoveredCells = 0
  var totalCells = gLevel.SIZE * gLevel.SIZE

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]
      if (currCell.isCovered) {
        totalCoveredCells++
      }
      
      if (currCell.isCovered && !currCell.isMine) {
        isGameOver = false
      }
    }
  }

  if (totalCoveredCells === gGame.lives) {
    alert('You Win!')
    gGame.isOn = false
  }
  
  return isGameOver
}

function setDifficulty(size) {
  gLevel.SIZE = size
  onInitGame()
}
