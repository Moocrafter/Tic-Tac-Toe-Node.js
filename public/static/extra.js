//Define the buttonResize function
function buttonResize() {
  $("#friendPlayer").css({ //Select the element with the friendPlayer id
    //Set the width of the Friend player button to the width of the Random Person button
  'width': (`${$("#randomPlayer").width()/* + /*(/*isiOS ? 40 : 0)*/}px`)
  });
}

//Set isiOS to the result of the a anonymous function
var isiOS = function() {
  //Set iDevices to a array of apple devices
  var iDevices = ['iPad Simulator','iPhone Simulator','iPod Simulator','iPad','iPhone','iPod'];

  //If the browser supports the navigator.platform or its set then continue
  if (!!navigator.platform) {
    //Loop through all the devices in the iDevices array
    while (iDevices.length) {
      //If the navigator.platform is the platform that was just popped of the list then return true
      if (navigator.platform === iDevices.pop()) return true;
    }
  }

  //If we aren't on ios then return false
  return false;
}();

//Define the resize function
function resize() {
  //Wait until the canvas appears
  if (document.getElementById("gameCanvas") == null) return false;

  var done = false;

  //Call the button resize function
  buttonResize();

  //Wait 100 milliseconds to allow ios devices to rotate
  setTimeout(function() {
    if (window.height > window.width) {
      //PORTRAIT
      canvas.style.width = `${window.width - (window.width / 18)}px`;
      canvas.style.height = `${window.width - (window.width / 18)}px`;

      //Scale the player choose div in the X direction
      var playerChoose = document.getElementByClassName(`playerChoose`);
      playerChoose.style.transform = `scaleX(${(window.width * window.height) / 342866.6666666667})`;
    }else {
      //LANDSCAPE
      /*if (Math.round((windowWidth * windowHeight) / 2691.5555555555557) - (windowWidth * windowHeight) / 2691.5555555555557 == 0) {
        var canvasSize  = (windowWidth * windowHeight) / 2691.5555555555557;
      }else {
        var canvasSize = (windowWidth * windowHeight) / 1977.6625;
      }*/

      //Get the clients height
      var clientHeight = document.documentElement.clientHeight;

      //Get the size we think the canvas should be
      var toBeSize = clientHeight - (clientHeight / 3);

      //If the size we think the canvas should be is greater than the window width than set the canvas size to the window width
      if (toBeSize > windowWidth) toBeSize = windowWidth;

      //Set the canvas size
      canvas.style.width = `${toBeSize}px`;
      canvas.style.height = `${toBeSize}px`;
    }

    //End the function with true
    return true;
  }, 100);
}

//On resize resize all elements who need resizing
window.onresize = () => resize();

//Start tic-tac-toe game with pre set id
function startWithId(gameCode, showCopied) {
  //Hide the game type pick
  document.getElementById(`gameTypePick`).style.display = `none`;

  //When we have the game code do all kinds of things with that
  gotGameCode(gameCode, 1, showCopied);

  //Show the extra data
  document.getElementById(`extraData`).style.display = ``;

  //Set is hidden to false
  isHidden = false;

  //Set waiting to false
  gameData.waiting = false;
}

//Show the element
function unfade(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}

//Hide the element
function fade(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

//Fade the copied game id message in and out
function fadeCopiedFunc() {
  copiedElem = document.getElementById("copiedMessage");
  unfade(copiedElem);
  setTimeout(() => {
    fade(copiedElem);
  }, 1500);
}

///If the client is on ios then to prevent scrolling set the position styling to fixed
if (isiOS) document.getElementsByTagName("body")[0].style.position = "fixed";

//-------Overlay Handling Parts-------

//position: absolute; top: 87.10369881109644vh
//Is a object which handles invalid game code parts
function InvalidCode() {
  //Make sure the code knows that the overlay is showing or not which allows us to allow clicking anywhere to close the overlay
  this.isShowing = true;

  //Change the url to remove the game code
  history.replaceState("", "Moocraft's Tic-Tac-Toe", "http://localhost:3000");

  //Define invalidOverlay as the overlay element for convenience
  var invalidOverlay = document.getElementById("invalidCodeOverlay");

  //If the canvas is showing then add some styling to push the overplay down some
  if (!isHidden) {
    invalidOverlay.style.position = "absolute";
    invalidOverlay.style.top = "87.10369881109644vh";
  }

  //Show the invalid code overlay
  invalidOverlay.style.display = "";

  //Handles closing events
  this.close = () => {
    //Set isShowing to false so when the window is clicked don't try to hide the overlay
    this.isShowing = false;

    //Hide the overlay
    invalidOverlay.style.display = "none";

    //If the game canvas is showing then hide it and remove special styling
    if (!isHidden) {
      //Reset the game
      resetGame();

      //Remove position and top styling
      invalidOverlay.style.position = "";
      invalidOverlay.style.top = "";
    }
  };
}

//Is a object which handles the other player overlay parts
function OtherLeft() {
  alert(1234567890)
  //Make sure the code knows that the overlay is showing or not which allows us to allow clicking anywhere to close the overlay
  this.isShowing = false;

  //Handles closing events
  this.close = () => {
    //this.isShowing to false so when we click the window it doesn't try to close the already closed overlay
    this.isShowing = false;

    //Hide the overlay
    document.getElementById("otherPlayerLeftOverlay").style.display = "none";

    //Reset the game
    resetGame()
  };

  //Handles opening events
  this.open = () => {
    alert(1);
    //Set this.isShowing to true so when we click the window it knows that it should close the overlay
    this.isShowing = true;

    //If the canvas is showing then add some styling to push the overplay down some
    document.getElementById("otherPlayerLeftOverlay").style.position = "absolute";
    document.getElementById("otherPlayerLeftOverlay").style.top = "87.10369881109644vh";

    //Show the overlay
    document.getElementById("otherPlayerLeftOverlay").style.display = "";

    //Change the url to remove the game code even if there isn't one it doesn't really matter
    history.replaceState("", "Moocraft's Tic-Tac-Toe", "http://localhost:3000");
  };
}

//When the window is clicked the function runs
window.onclick = () => {
  //As long as invalidCode is not undefined then check if the overlay is showing if so close it
  if (invalidCode != undefined) if (invalidCode.isShowing) invalidCode.close();

  //Check if the overlay is showing if so close it and move to home screen
  if (otherLeft.isShowing) otherLeft.close(); //Close the overlay and hide lots of other things
};

async function resetGame() {
  //Hide the canvas
  document.getElementById("gameCanvas").style.display = "none";

  //Hide the extra data
  document.getElementById("extraData").style.display = "none";

  //Show the game type pick menu
  document.getElementById("gameTypePick").style.display = "";

  //Set the current turn element text to Current Turn: Unavailable so there is a current urn for just before we get the current turn from the server
  document.getElementById("turns").innerHTML = "Current Turn: Unavailable";

  //Resize the game type pick buttons
  buttonResize();

  //Set isHidden to true to tell the canvas not to waste time on drawing the canvas
  isHidden = true;

  //Reset gameData
  gameData = {
    "waiting" : true,
    "gameId" : "",
    "myMark" : null,
    "myTurn" : false,
    "winner" : null,
  };

  //Set gameData.board to a array with 9 items of value undefined
  gameData.board = Array.apply(null, Array(9)).map(function (x, i) { return null; });
}

//Cross browser copy to clipboard function
function copyToClipboard(text) {
  if (navigator.clipboard) { //Chrome, Firefox, Opera || Android webview, Chrome for Android, Firefox for Android, Opera for Android, Samsung Internet
    navigator.clipboard.writeText(text);
  } else if (window.clipboardData) { // IE
    window.clipboardData.setData('text', text);
  } else { // other browsers, iOS, Mac OS
    myClipboard.copy(text);
  }
}