'use strict'

// var gCinema
// var gElSelectedSeat = null

function onInitGame() {
  gGamerPos = { i: 2, j: 9 }
  clearInterval(gBallInterval)
  clearInterval(gGlueInterval)
  gCollectedBalls = 0
  gTotalBalls = 0
  gBoard = buildBoard()
  renderBallCount()
  renderNeighborsCount()
  renderBoard(gBoard)
  // gBallInterval = setInterval(addBall,5000)
  gGlueInterval = setInterval(addGlue, 5000)
}

function buildBoard() {
  const board = createMat(10, 12)
  for (var i = 0; i < board.length; i++) {
    const rowMiddle = Math.floor(board.length / 2)
    const colMiddle = Math.floor((board[i].length - 1) / 2)
    for (var j = 0; j < board[0].length; j++) {
      board[i][j] = { type: FLOOR, gameElement: null }
      if ((i === 0 || i === board.length - 1 ||
        j === 0 || j === board[0].length - 1) &&
        (i !== rowMiddle && j !== colMiddle)) {
        board[i][j].type = WALL
      }
    }
  }

  // Place the gamer and two balls
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

  board[2][2].gameElement = BALL
  gTotalBalls++
  board[7][4].gameElement = BALL
  gTotalBalls++

  // console.log(board)
  return board
}

// Render the board to an HTML table
function renderBoard(board) {

  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j] // {type,gameElement}
      // console.log('currCell:', currCell)

      var cellClass = getClassName({ i: i, j: j }) // 'cell-0-0'

      if (currCell.type === FLOOR) cellClass += ' floor'
      else if (currCell.type === WALL) cellClass += ' wall'

      strHTML += '<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >'

      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG
      }

      strHTML += '</td>'
    }
    strHTML += '</tr>'
  }

  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
  if (gIsGlued) return
  // console.log('i, j:', i, j)
  if (i < 0) i = gBoard.length - 1
  if (i >= gBoard.length) i = 0
  if (j < 0) j = gBoard[i].length - 1
  if (j >= gBoard[i].length) j = 0

  // console.log('i, j:', i, j)
  const targetCell = gBoard[i][j]
  if (targetCell.type === WALL) return

  // Calculate distance to make sure we are moving to a neighbor cell
  const iAbsDiff = Math.abs(i - gGamerPos.i)
  // console.log('iAbsDiff:', iAbsDiff)
  const jAbsDiff = Math.abs(j - gGamerPos.j)
  // console.log('jAbsDiff:', jAbsDiff)

  // If the clicked Cell is one of the four allowed
  if ((iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) || (iAbsDiff === gBoard.length - 1 && jAbsDiff === 0) || (jAbsDiff === gBoard[i].length - 1 && iAbsDiff === 0)) {
    // console.log('MOVE')

    if (targetCell.gameElement === BALL) {
      playBallSound()
      gCollectedBalls++
      renderBallCount()
      if (gCollectedBalls === gTotalBalls) setTimeout(gameOver, 200)
        // console.log('Collecting!')
    }

    if (targetCell.gameElement === GLUE) {
      gIsGlued = true
      setTimeout(() => {
        gIsGlued = false
      }, 3000);
    }

    // Move the gamer
    // Moving from current position:
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    
    // Dom:
    renderCell(gGamerPos, '')


    // Moving to selected position:
    // Model:
    gGamerPos.i = i
    gGamerPos.j = j
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    
    // Dom:
    renderCell(gGamerPos, GAMER_IMG)
    renderNeighborsCount()

  } else console.log('TOO FAR', iAbsDiff, jAbsDiff)
}

// Move the player by keyboard arrows
function onHandleKey(event) {
  // console.log('event:', event)
  const i = gGamerPos.i
  const j = gGamerPos.j

  switch (event.key) {
    case 'ArrowLeft':
      moveTo(i, j - 1)
      break
    case 'ArrowRight':
      moveTo(i, j + 1)
      break
    case 'ArrowUp':
      moveTo(i - 1, j)
      break
    case 'ArrowDown':
      moveTo(i + 1, j)
      break
  }
}

function addBall() {
  //update Model
  const cell = getEmptyValidCell()
  gBoard[cell.i][cell.j].gameElement = BALL
  gTotalBalls++
  renderNeighborsCount()
  //Update DOM
  renderCell(cell, BALL_IMG)
}

function playBallSound() {
  var audio = new Audio('/sucess.mp3')
  audio.play()
}

function renderBallCount() {
  var ballCounter = document.querySelector('.progress')
  ballCounter.innerHTML = `<h3>Collected Balls: ${gCollectedBalls}</h3>`
}

function gameOver() {
  clearInterval(gBallInterval)
  openModal()
}

function openModal() {
  document.querySelector('.modal').style.display = 'block'
}

function closeModal() {
  document.querySelector('.modal').style.display = 'none'
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

function getEmptyValidCell() {
  var validCell = false
  while (!validCell) {
    var i = getRandomInt(0, gBoard.length)
    var j = getRandomInt(0, gBoard[i].length)
    if (isEmptyValidCell(i, j)) validCell = true
  }
  return { i, j }
}

function isEmptyValidCell(i, j) {
  return (!gBoard[i][j].gameElement && gBoard[i][j].type !== 'WALL')
}

// Returns the class name for a specific cell
function getClassName(location) { // {i:2,j:5}
  const cellClass = `cell-${location.i}-${location.j}` // 'cell-2-5'
  return cellClass
}

function countMinesAround(cellI, cellJ) {
  var minesCount = 0
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= gBoard[i].length) continue
      if (gBoard[i][j].isMine) minesCount++
    }
  }
  return minesCount
}

function renderMinesCount() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var elCell = document.querySelector(`.cell-${i}-${j}`)
      var minesCount = countMinesAround(i, j)
      if (minesCount > 0 && !gBoard[i][j].isMine) {
        elCell.innerText = minesCount
      }
    }
  }
}




