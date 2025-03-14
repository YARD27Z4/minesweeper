const MINE = '💣'
const FLAG = '🚩'
const NORMAL = '😊'
const LOSE = '😑'
const WIN = '😍'

var gBoard
var firstClick = true
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
  hintsLeft: 3,
  isHintActive: false
}

// אתחול המשחק
function onInitGame() {
  gGame = {
    isOn: true,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    hintsLeft: 3,
    isHintActive: false
  }
  firstClick = true
  document.getElementById('lives').innerText = '❤️Lives: ' + gGame.lives
  gBoard = buildBoard()
  renderBoard()
}

// בניית הלוח
function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isCovered: true,
        isMine: false,
        isMarked: false,
        isShown: false
      }
    }
  }
  return board
}

// הצגת הלוח ב-HTML
function renderBoard() {
  var strHTML = ''
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < gLevel.SIZE; j++) {
      strHTML += `<td class="cell covered cell-${i}-${j}"
                    data-i="${i}" data-j="${j}"
                    onclick="onCellClicked(this, ${i}, ${j})"
                    oncontextmenu="onCellRightClick(event, ${i}, ${j})">
                  </td>`
    }
    strHTML += '</tr>'
  }
  document.querySelector('.board').innerHTML = strHTML
}

// סימון דגל על התא בלחיצה ימנית
function onCellRightClick(event, i, j) {
  event.preventDefault()
  if (!gGame.isOn || gBoard[i][j].isShown) return
  
  var cell = gBoard[i][j]
  var elCell = document.querySelector(`.cell-${i}-${j}`)
  
  if (cell.isMarked) {
    cell.isMarked = false
    elCell.innerText = ''
    gGame.markedCount--
  } else {
    cell.isMarked = true
    elCell.innerText = FLAG
    gGame.markedCount++
  }
  checkGameOver()
}

// לחיצה על תא
function onCellClicked(elCell, i, j) {
  if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return

  if (firstClick) {
    setMinesOnBoard(i, j)
    firstClick = false
  }

  var cell = gBoard[i][j]
  cell.isShown = true
  elCell.classList.remove('covered')

  if (cell.isMine) {
    elCell.innerText = MINE
    gGame.lives--
    document.getElementById('lives').innerText = '❤️Lives: ' + gGame.lives
    if (gGame.lives === 0) {
      gameOver(false)
    }
  } else {
    elCell.innerText = cell.minesAroundCount || ''
    gGame.revealedCount++

    // אם אין מוקשים סביב התא - הפעל חשיפה רקורסיבית
    if (cell.minesAroundCount === 0) {
      expandReveal(i, j)
    }

    checkGameOver()
  }
}

// קביעת מוקשים בלוח
function setMinesOnBoard(firstI, firstJ) {
  var availablePositions = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (i !== firstI || j !== firstJ) {
        availablePositions.push({ i: i, j: j })
      }
    }
  }
  for (var m = 0; m < gLevel.MINES; m++) {
    var randomIdx = Math.floor(Math.random() * availablePositions.length)
    var pos = availablePositions.splice(randomIdx, 1)[0]
    gBoard[pos.i][pos.j].isMine = true
  }
  setMinesNegsCount()
}

// חישוב מספר מוקשים מסביב לכל תא
function setMinesNegsCount() {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (!gBoard[i][j].isMine) {
        gBoard[i][j].minesAroundCount = countMinesAround(i, j)
      }
    }
  }
}

// ספירת מוקשים מסביב לתא
function countMinesAround(row, col) {
  var count = 0
  for (var i = row - 1; i <= row + 1; i++) {
    for (var j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && i < gLevel.SIZE && j >= 0 && j < gLevel.SIZE) {
        if (gBoard[i][j].isMine) count++
      }
    }
  }
  return count
}

// פונקציה לפתיחת קבוצות תאים (רקורסיבית)
function expandReveal(i, j) {
  for (var x = i - 1; x <= i + 1; x++) {
    for (var y = j - 1; y <= j + 1; y++) {
      if (x >= 0 && x < gLevel.SIZE && y >= 0 && y < gLevel.SIZE) {
        var neighbor = gBoard[x][y]
        var elNeighbor = document.querySelector(`.cell-${x}-${y}`)
        
        if (!neighbor.isShown && !neighbor.isMine) {
          neighbor.isShown = true
          elNeighbor.classList.remove('covered')
          elNeighbor.innerText = neighbor.minesAroundCount || ''
          
          // אם אין מוקשים מסביב - המשך לחשוף את השכנים
          if (neighbor.minesAroundCount === 0) {
            expandReveal(x, y)
          }
        }
      }
    }
  }
}

// סיום המשחק
function gameOver(isWin) {
  gGame.isOn = false
  alert(isWin ? '🎉 You Win! 🎉' : '💥 Game Over!')
  revealAllMines()
}

// שינוי רמת קושי
function setDifficulty(size) {
  gLevel.SIZE = size
  gLevel.MINES = Math.floor(size * size * 0.2)
  onInitGame()
}

// פונקציה להחלפת מצב כהה
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');

  var isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark); // שמירת המצב ב-Local Storage

  // עדכון הטקסט של הכפתור בהתאם למצב
  var darkModeButton = document.getElementById('darkModeToggle');
  darkModeButton.innerText = isDark ? '☀️ Light mood' : '🌙 Dark mood';
}

// פונקציה לטעינת מצב כהה מהאחסון ושמירתו אחרי רענון
function applyDarkMode() {
  var isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').innerText = '☀️ Light mood';
  }
}

// הפעלת מצב כהה אם נשמר בהגדרות
applyDarkMode();
