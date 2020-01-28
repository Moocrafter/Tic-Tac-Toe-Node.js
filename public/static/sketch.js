function setup() {
  //Create the canvas and set my canavs to the canvas
  let mycanvas = createCanvas(400, 400);

  //Put our canavs into a div with the id of gameCanvas
  mycanvas.parent(`gameCanvas`);

  //Attach listener for activity on canvas only
  mycanvas.mouseClicked(canvasClicked);

  //Set the stroke weight to 10
  strokeWeight(10);
}

//Set the gameData to the staring postion
var gameData = {
  "waiting" : false,
  "gameId" : "",
  "myMark" : null,
  "myTurn" : false,
}

//Define isHidden as true so the draw function doesn't draw when we can't see the canvas
var isHidden = true;

var canavsCreated = false;

//Set gameData.board to a array with 9 items of value undefined
gameData.board = Array.apply(null, Array(9)).map(function (x, i) { return null; });

function draw() {
  //Once the canvas has been created p5js calls draw so I just set canavs created to true the first time through draw
  if (!canavsCreated) {canavsCreated = true;resize();}

  //If isHidden is true meaning the canvas shouldn't be showing then don't draw to the canvas
  if (!isHidden) {
    //Set the background to 220 red,green,blue which is a nice gray color
    background(220);

    //If canvasState is 0 meaning we want to show the game board then draw the game board and change otehr info
    if (!gameData.waiting) {
      //Draw the grid
      drawGrid();

      //Draw marks where they are needed
      drawMarks();

      if (gameData.myTurn) {
        document.getElementById("turns").children[0].innerText = "Current Turn: You";
      }else {
        document.getElementById("turns").children[0].innerText = "Current Turn: Opponent";
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

      //Show the text
      text(`Have a friend go to\nlocalhost:3000/${gameData.gameId}`, 11.5/*-80*/, /*45*/30)
    }
  }
}

function canvasClicked() {
  if (!gameData.waiting && gameData.myTurn) {
    //First Row
    if (mouseX > 0 && mouseX < 133 && mouseY > 0 && mouseY < 133 && gameData.board[0] == undefined) addMarkToList(0, gameData.myMark);
    if (mouseX > 133 && mouseX < 266 && mouseY > 0 && mouseY < 133 && gameData.board[1] == undefined) addMarkToList(1, gameData.myMark);
    if (mouseX > 266 && mouseX < 400 && mouseY > 0 && mouseY < 133 && gameData.board[2] == undefined) addMarkToList(2, gameData.myMark);

    //Second Row
    if (mouseX > 0 && mouseX < 133 && mouseY > 133 && mouseY < 266 && gameData.board[3] == undefined) addMarkToList(3, gameData.myMark);
    if (mouseX > 133 && mouseX < 266 && mouseY > 133 && mouseY < 266 && gameData.board[4] == undefined) addMarkToList(4, gameData.myMark);
    if (mouseX > 266 && mouseX < 400 && mouseY > 133 && mouseY < 266 && gameData.board[5] == undefined) addMarkToList(5, gameData.myMark);

    //Third Row
    if (mouseX > 0 && mouseX < 133 && mouseY > 266 && mouseY < 400 && gameData.board[6] == undefined) addMarkToList(6, gameData.myMark);
    if (mouseX > 133 && mouseX < 266 && mouseY > 266 && mouseY < 400 && gameData.board[7] == undefined) addMarkToList(7, gameData.myMark);
    if (mouseX > 266 && mouseX < 400 && mouseY > 266 && mouseY < 400 && gameData.board[8] == undefined) addMarkToList(8, gameData.myMark);
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
  
  //If mark is 0 meaning we have just drawen a X then set the stroke color to black and end the function
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

function drawMarks() {
  //Set board to gameData.board for convenience
  var board = gameData.board;

  //Loop through all of the spots in the board
  for (var i = 0; i < board.length; i++) {
    //If board[i] is null that m eans it's blank otherwsie draw a mark at the location we want with the mark we want
    if (board[i] != null) drawMark(i, board[i]);
  }
}

function addMarkToList(loc, markType, fromServ) {
  if (!fromServ) {
    socker.emit("markPlaced", {
      "markType"
    })
  }
  //Change the turn once a mark is placed by either the current player or the server
  gameData.myTurn = !gameData.myTurn;

  //Add the mark of either player to the game board
  gameData.board[loc] = markType;
}

function gameTypePick(type) {
  //Random Player
  if (type == 0) {
    
  }else if (type == 1) { //Friend
    socket.emit("getGameCode", 1);
    document.getElementById("gameTypePick").style.display = `none`;
  }
}

function gotGameCode(gameCode, type, showCopied) {
  console.log(`Game Code: ${gameCode}\nType: ${type == 1 ? `Friend` : `Random`}`);
  gameData.gameId = gameCode;
  isHidden = false;
  gameData.waiting = true;
  document.getElementById("copiedParent").style.display = (showCopied ? "" : "none");
  document.getElementById("gameCanvas").style.display = ``;
}