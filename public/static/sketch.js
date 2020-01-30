function setup() {
  //Create the canvas and set my canvas to the canvas
  let mycanvas = createCanvas(400, 400);

  //Put our canvas into a div with the id of gameCanvas
  mycanvas.parent(`gameCanvas`);

  //Attach listener for activity on canvas only
  mycanvas.mouseClicked(canvasClicked);

  //Set the stroke weight to 10
  strokeWeight(10);
}

//Set the gameData to the staring position
var gameData = {
  "waiting" : false,
  "gameId" : "",
  "myMark" : null,
  "myTurn" : false,
  "winner" : null,
};

//Define isHidden as true so the draw function doesn't draw when we can't see the canvas
var isHidden = true;

//Set canvasCreated to false so we know the canvas has not been created
var canvasCreated = false;

//Set gameData.board to a array with 9 items of value undefined
gameData.board = Array.apply(null, Array(9)).map(function (x, i) { return null; });

function draw() {
  //Once the canvas has been created p5js calls draw so I just set canvas created to true the first time through draw
  if (!canvasCreated) {canvasCreated = true;resize();}

  //If isHidden is true meaning the canvas shouldn't be showing then don't draw to the canvas
  if (!isHidden) {
    //Set the background to 220 red,green,blue which is a nice gray color
    background(220);

    //If canvasState is 0 meaning we want to show the game board then draw the game board and change other info
    if (!gameData.waiting) {
      //Draw the grid
      drawGrid();

      //Draw marks where they are needed
      drawMarks();

      //Check if there is a winner
      if (gameData.winner != null) {
        //Draw the win line
        drawWinLine()
      }
    }else { //If we are waiting for the other player to join then show a waiting message
      //Set the textSize to 50
     // textSize(45);

      //Show the text Waiting at 80, 70
     // text(`Waiting . . .`, 80, 150);

      /*//Show the text You at 45, 200
      text(`You`, 45, 200);

      //
      stroke(255, 0, 0)
      line(30, 235, 153, 358);
      line(30, 358, 153, 235);

      //Turn off stroke
      noStroke();
    //}else if (canvasState == 1) {
      /*textSize(33);
      text(`Have a friend go to\nlocalhost:3000/${gameData.gameId}`, 17, 45)*/
      //textSize(33);

      //textFont(myFont);
      //Turn off the stroke to avoid problems
      noStroke();

      //Make the text bold
      textStyle(BOLD);

      //Set the text size
      textSize(25);

      //Set the text color
      fill(0);

      //Show the text
      text(`Have a friend go to\nlocalhost:3000/${gameData.gameId}`, 11.5/*-80*/, /*45*/30);
    }
  }
}

function canvasClicked() {
  if (!gameData.waiting && gameData.myTurn) {
    //First Row
    if (mouseX > 0 && mouseX < 133 && mouseY > 0 && mouseY < 133 && gameData.board[0] == null) addMarkToList(0, gameData.myMark, true);
    if (mouseX > 133 && mouseX < 266 && mouseY > 0 && mouseY < 133 && gameData.board[1] == null) addMarkToList(1, gameData.myMark, true);
    if (mouseX > 266 && mouseX < 400 && mouseY > 0 && mouseY < 133 && gameData.board[2] == null) addMarkToList(2, gameData.myMark, true);

    //Second Row
    if (mouseX > 0 && mouseX < 133 && mouseY > 133 && mouseY < 266 && gameData.board[3] == null) addMarkToList(3, gameData.myMark, true);
    if (mouseX > 133 && mouseX < 266 && mouseY > 133 && mouseY < 266 && gameData.board[4] == null) addMarkToList(4, gameData.myMark, true);
    if (mouseX > 266 && mouseX < 400 && mouseY > 133 && mouseY < 266 && gameData.board[5] == null) addMarkToList(5, gameData.myMark, true);

    //Third Row
    if (mouseX > 0 && mouseX < 133 && mouseY > 266 && mouseY < 400 && gameData.board[6] == null) addMarkToList(6, gameData.myMark, true);
    if (mouseX > 133 && mouseX < 266 && mouseY > 266 && mouseY < 400 && gameData.board[7] == null) addMarkToList(7, gameData.myMark, true);
    if (mouseX > 266 && mouseX < 400 && mouseY > 266 && mouseY < 400 && gameData.board[8] == null) addMarkToList(8, gameData.myMark, true);
  }
}

//Define the drawGrid function
function drawGrid() {
  //Set the stroke to black
  stroke(0);

  //Draw the game grid
  line(133, 0, 133, 400);
  line(266, 0, 266, 400);
  line(0, 133, 400, 133);
  line(0, 266, 400, 266);
}

//Define the drawMArk function
function drawMark(loc, mark) {
  //The code below is for drawing a X until said other wise
  //Set the stroke color to red
  stroke(255, 0, 0);
  
  /*//Define val5
  var val5 = Math.floor((((width * height) * 0.0000625) * width) / 800);
  
  //Define val123
  var val123 = 133.252032520325203;
  
  //If the val123 needs changed then do that
  if (Math.floor(val123) < Math.round(val123)) {
    val123 -= 1;
  }else if (Math.floor(133.252032520325203) < Math.ceil(133.252032520325203)) {
    val123 += 2;
  }
  
  var val143 = (Math.round(width / 2.797202797202797) + ((width % 8 != 0) ? 4 : 0)) - ((width % -98 == 6) ? 6 : 0);
  
  var val257 = (width / 1.550387596899225) - ((Number((width % -99.1).toFixed(2)) == 4.5) ? 4.5  : 0);
  
  var val395 = Math.round(width / 1.0126582278481013) - ((width % 209 == 91) ? 91 : 0);
  
  var val277 = Math.round(width / 1.444043321299639) + ((width % 16 == 4) ? 4 : 0) + ((width % 75 == 0) ? 133.4482758620689653 : 0);
  */
  
  //First Row
  if (loc == 0 && mark == 0) {
    line(5, 5, 123, 123);
    line(5, 123, 123, 5);
  }else if (loc == 1 && mark == 0) {
    line(143, 5, 256, 123);
    line(256, 5, 143, 123);
  }else if (loc == 2 && mark == 0) {
    line(277, 5, 395, 123);
    line(395, 5, 277, 123);
  //Second Row
  }else if (loc == 3 && mark == 0) {
    line(5, 143, 123, 256);
    line(123, 143, 5, 256);
  }else if (loc == 4 && mark == 0) {
    line(143, 143, 257, 256);
    line(257, 143, 143, 256);
  }else if (loc == 5 && mark == 0) {
    line(277, 143, 395, 256);
    line(395, 143, 277, 256);
  //Third Row
  }else if (loc == 6 && mark == 0) {
    line(5, 277, 123, 395);
    line(123, 277, 5, 395);
  }else if (loc == 7 && mark == 0) {
    line(143, 277, 257, 395);
    line(257, 277, 143, 395);
  }else if (loc == 8 && mark == 0) {
    line(277, 277, 395, 395);
    line(395, 277, 277, 395);
  }
  
  //If mark is 0 that means that we had just drew a X mark
  if (mark == 0) {
    //Set the stroke to black
    stroke(0);

    //End the function
    return;
  }
  
  //If mark is 0 meaning we have just drawn a X then set the stroke color to black and end the function
  //Turn off the fill
  noFill();

  //Set the stroke color to green
  stroke(0, 128, 0);
  
  //First Row
  if (loc == 0 && mark == 1) {
    circle(64, 64, 90);
  }else if (loc == 1 && mark == 1) {
    circle(200.5, 64, 90);
  }else if (loc == 2 && mark == 1) {
    circle(336, 64, 90);
  //Second Row
  }else if (loc == 3 && mark == 1) {
    circle(64, 200, 90);
  }else if (loc == 4 && mark == 1) {
    circle(200.5, 200, 90);
  }else if (loc == 5 && mark == 1) {
    circle(336, 200, 90);
  //Third Row
  }else if (loc == 6 && mark == 1) {
    circle(64, 336, 90);
  }else if (loc == 7 && mark == 1) {
    circle(200.5, 336, 90);
  }else if (loc == 8 && mark == 1) {
    circle(336, 336, 90);
  }
}


//Check for a winner or tie
function checkForWinner() {
  //Set winner to null because we don't have a valid winner yet
  var winner = null;
  
  //Check rows
  for (var i = 0; i < 3; i++) {
    //Check if the current row is a wining row
    if (gameData.board[0 + (i * 3)] == gameData.board[2 + (i * 3)] && gameData.board[1 + (i * 3)] == gameData.board[0 + (i * 3)]) {
      //Set the winner
      winner = gameData.board[0 + (i * 3)];

      //Set the winning row or winRow to the current row
      gameData.winRow = i;

      //Set the winning columns or winCol to null because we are checking the rows
      gameData.winCol = null;

      //Set the winning diagonals or winDig to null because we are checking the rows
      gameData.winDig = null;

      //Break out of the loop because we have found a winner
      break;
    }
  }

  //Check columns
  for (var i = 0; i < 3; i++) {
    if (gameData.board[0 + i] == gameData.board[3 + i] && gameData.board[6 + i] == gameData.board[0 + i]) {
      //Set the winner
      winner = gameData.board[0 + i];

      //Set the winning rows or winRow to null because we are checking the columns
      gameData.winRow = null;

      //Set the winning column or winCol to the current column
      gameData.winCol = i;

      //Set the winning diagonals or winDig to null because we are checking the rows
      gameData.winDig = null;

      //Break out of the loop because we have found a winner
      break;
    }
  }
  
  //Check diagonals
  if (gameData.board[0] == gameData.board[4] && gameData.board[8] == gameData.board[0]) {
    //Set the winner
    winner = gameData.board[0];

    //Set the winning rows or winRow to null because we are checking the columns
    gameData.winRow = null;

    //Set the winning columns or winCol to null because we are checking the rows
    gameData.winCol = null;

    //Set the winning diagonal or winDig to the current diagonal
    gameData.winDig = 0;
  }else if (gameData.board[2] == gameData.board[4] && gameData.board[6] == gameData.board[2]) {
    //Set the winner
    winner = gameData.board[2];

    //Set the winning rows or winRow to null because we are checking the columns
    gameData.winRow = null;

    //Set the winning columns or winCol to null because we are checking the rows
    gameData.winCol = null;

    //Set the winning diagonal or winDig to the current diagonal
    gameData.winDig = 1;
  }

  //Check if their is a winner
  if (winner != null) {
    //Log who the winner is
    console.log(`Winner: ${winner == 0 ? "X" : "O"}`);

    //Set the winner in the gameData
    gameData.winner = winner;
  }

  //Set isTie to tue
  var isTie = true;

  //Loop though all of the positions that a mark can be placed
  for (var i = 0; i < 9; i++) {
    //Check if the current position is null or empty
    if (gameData.board[i] == null) {
      //If the current position is null that means the board is not full thus there can't be a tie
      isTie = false;

      //Break out of the loop
      break;
    }
  }

  //If its a tie then log that
  if (isTie) {
    //Log that the game is a tie
    console.log("Tie!");
  }
}

//Define drawWinLine which draws the win line
function drawWinLine() {
  var winRow = gameData.winRow;
  var winner = gameData.winner;
  //stroke((winner == 0 ? 255 : 0), (winner == 0 ? 0 : 128), 0);
  stroke(0, 128, 0);
  if (winRow != null) {
    if (winRow == 0) {
       line(0, 64, 400, 64);
    }
  }
}

//Draw marks on board
function drawMarks() {
  //Set board to gameData.board for convenience
  var board = gameData.board;

  //Loop through all of the spots in the board
  for (var i = 0; i < board.length; i++) {
    //If board[i] is null that means it's blank otherwise draw a mark at the location we want with the mark we want
    if (board[i] != null) drawMark(i, board[i]);
  }
}

function addMarkToList(loc, markType, fromClient) {
  //Change the turn once a mark is placed by either the current player or the server
  gameData.myTurn = !gameData.myTurn;

  //Add the mark of either player to the game board
  gameData.board[loc] = markType;

  //Change the turn
  document.getElementById("turns").innerHTML = `Current Turn: ${gameData.myTurn ? "You" : "Opponent"}`;

  //Check if the player is the one who placed the mark
  if (fromClient) {
    //Tell the server that the current player made a mark
    socket.emit("placedMark", loc);
  }

  checkForWinner();
}

function gameTypePick(type) {
  //Random Player
  if (type == 0) {
    
  }else if (type == 1) { //Friend
    socket.emit("getGameCode", 1);
    document.getElementById("gameTypePick").style.display = `none`;
  }
}

//Runs when we have gotten the game code
function gotGameCode(gameCode, type, showCopied) {
  //Log the game code and what game mode they are playing in
  console.log(`Game Code: ${gameCode}\nType: ${type == 1 ? `Friend` : `Random`}`);

  //Set the game id in game data
  gameData.gameId = gameCode;

  //Set isHidden to false to make the canvas start drawing
  isHidden = false;

  //Set gameData.waiting so the canvas knows to show the waiting text
  gameData.waiting = true;

  //Show the copy button
  document.getElementById("copiedParent").style.display = (showCopied ? "" : "none");

  //Show the canvas
  document.getElementById("gameCanvas").style.display = ``;
}
