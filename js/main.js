'use strict'
const MINE = '💣'
const FLAG = '🚩'
const NORMAL = '🙂'
const LOSE = '🤯'
const WIN = '😎'

var gBoard
var gLevel = {
  SIZE: 4,
  MINES: 2
}

var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0
}

function onInitGame() {
  gBoard = buildBoard()
  setMinesOnBoard()
  renderBoard(gBoard)
}

function setMinesOnBoard() {
  var minesCount = gLevel.MINES
  while (minesCount > 0) {
    var i = getRandomInt(0, gLevel.SIZE)
    var j = getRandomInt(0, gLevel.SIZE)
    if (!gBoard[i][j].isMine) {
      gBoard[i][j].isMine = true
      minesCount--
      updateNeighboringCells(gBoard, i, j)
    }
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
      var cellContent = cell.isMine
        ? MINE
        : cell.minesAroundCount > 0
        ? cell.minesAroundCount
        : ''

      var className = ''
      var content = ''

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
  var currCell = gBoard[i][j]
  if (currCell.isMine) {
    alert('Game Over!')
    revealAllMines()
  } else {
    expandReveal(gBoard, elCell, i, j)
  }
  checkGameOver(gBoard)
}

function revealAllMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var currCell = gBoard[i][j]
      if (currCell.isMine) {
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.innerText = MINE
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
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]
      if (!currCell.isShown && !currCell.isMine) {
        isGameOver = false
      }
    }
  }

  if (isGameOver) {
    alert('You Win!')
  }
}

function getClassName(location) {
  return `cell-${location.i}-${location.j}` // מחזיר את שם המחלקה של התא
}
