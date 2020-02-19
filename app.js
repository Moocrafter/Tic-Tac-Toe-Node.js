//Require all the necessary modules
const fs = require('fs');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var serveStatic = require('serve-static');
var Profane = require('profane');

//Setup the profane library
var p = new Profane();

//Set the port
const port = 3000;

//Setup all needed variables
var games = {};
var tempGames = {};
var userToGame = {};
var randPlayQueue = [];

//GET / and send it to the user
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

//Serve static files
app.use(serveStatic('public/static'));

//GET /${gameCode} and send it to the user
app.get('/:gameCode', (req, res) => {
	//Read index.html
	var data = fs.readFileSync(`./public/index.html`).toString();

	//Write the data from index.html
	res.write(data);

	//Make sure that the game code used is valid if not then tell the client
	if (tempGames.hasOwnProperty(req.params.gameCode)) {
		//Write script tag that has the client start with a id
		res.write(`<script id="remove">startWithId("${req.params.gameCode}", false);gameData.waiting = false;document.getElementById("remove").outerHTML = "";</script>`);
	}else {
		//Write a line of js code that shows a "invalid code" message on screen if the game code provided is not real 
		res.write(`<script id="remove">invalidCode = new InvalidCode();document.getElementById("remove").outerHTML = "";</script>`);
	}

	//End the connection
	res.end();
});

//Runs on socket connection
io.on('connection', (socket) => {
	//Log that a user connected
	console.log('a user connected || ' + socket.handshake.headers.referer);

	if (/https*:\/\/localhost:3000\/(........)/.test(socket.handshake.headers.referer)) {
		if (tempGames.hasOwnProperty(socket.handshake.headers.referer.replace(/https*:\/\/localhost:3000\//, ""))) {
			//Set thisId to the id the client used
			var thisId = socket.handshake.headers.referer.replace(/https*:\/\/localhost:3000\//, "");

			//Set the socket id for a game to p2
			tempGames[thisId][socket.id] = "p2";

			//Setup the p2 player
			tempGames[thisId].p2 = {
				"socketId" : socket.id,
				"myTurn" : false,
			};

			//Add the user to the userToGame object
			userToGame[socket.id] = thisId;

			//Move the game from tempGames to games
			games[thisId] = tempGames[thisId];

			//Delete the old tempGame
			delete tempGames[thisId];

			//Tell p1 that p2 has joined
			socket.to(games[thisId].p1.socketId).emit(`otherJoined`);

			//Set workingGame to the current game we are working on
			var workingGame = games[thisId];

			//Generate a random number 0 or 1
			workingGame.currentTurn = Math.round(Math.random());

			//Define markCount so we can count the number of marks
			workingGame.markCount = 0;

			//Define winner so we can tell if there is a winner or tie
			workingGame.winner = null;

			console.log(workingGame.p1.socketId + " || Line: 93")
			//Send the opposite of the random number to p2
			socket.emit("startPlayerData", (workingGame.currentTurn == 0 ? 1 : 0));

			//Send the original random number to p1
			socket.to(workingGame.p1.socketId).emit("startPlayerData", workingGame.currentTurn);
			
			//Set the myTurn option of both player 1 and player 2
			workingGame.p1.myTurn = (workingGame.currentTurn == 0 ? true : false);
			workingGame.p2.myTurn = (workingGame.currentTurn == 1 ? true : false);
		}
	}

	//When a user disconnects log it
	socket.on('disconnect', () => {
		console.log('user disconnected');

		//If a player is starting a game or is in a game and disconnects then notify the other player and remove the game
		console.log(`This socket id: ${socket.id}\nuserToGame: ${JSON.stringify(userToGame)}`);

		//Define the playerSocketId var because after a while we lose the players socket id
		var playerSocketId = socket.id;
		
		//If the user is part of a game or tempGame then notify the other player
		if (userToGame.hasOwnProperty(playerSocketId)) {
			//Get this players game id
			var thisId = userToGame[playerSocketId];

			//If the player who disconnected is in an active otherwise its in a tempGame
			if (games.hasOwnProperty(thisId)) {
				//Set thisPlayer to p1 or p2 based on if they are p1 or p2
				var thisPlayer = games[thisId][playerSocketId];

				//Send the other player a message that this player disconnected
				io.to(otherPlayer(playerSocketId, thisId, 1, true)).emit(`otherPlayerLeft`);
				
				//Log info about the user who disconnected
				console.log(`This socket id: ${playerSocketId}\nSocket id removed: ${JSON.stringify(games[thisId][(games[thisId][playerSocketId] == "p1" ? "p2" : "p1")])}`);

				//Delete the game
				deleteGame(thisId, playerSocketId, true);
			}else if (tempGames.hasOwnProperty(thisId)) {
				//If there are more than two players in a tempGame than send a disconnect message
				//if (Object.keys(tempGames[thisId]).length > 2) socket.to(tempGames[thisId][(tempGames[thisId][playerSocketId] == "p1" ? "p2" : "p1")].socketId).emit(`otherPlayerLeft`, ``);
			
				//Remove the other player from the userToGame object from the context of tempGames
				delete userToGame[tempGames[thisId][(tempGames[thisId][playerSocketId] == "p1" ? "p2" : "p1")]];

				//Delete the temporary game
				delete tempGames[thisId];
			}else {
				//Delete the player from the randPlayQueue or the random player queue
				delete randPlayQueue[playerSocketId];
			}

			//Delete the old user from the userToGame object
			delete userToGame[playerSocketId];
		}
	});

	//When a user wants to get a new game code generate one and set up a temp game
	socket.on('getGameCode', (type) => {
		//Create a temporary game and return the game id
		var thisId = createTempGame(socket);

		//Tell the client that the game code hs been generated and accepted
		socket.emit(`recvGameCode`, thisId, type);
	});

	//Runs when a user requests to play against a random player
	socket.on("randPlayReq", function() {
		//If the number of people in the queue is greater then or equal to 1 then create a game with both the current player and and the player in the queue
		if (randPlayQueue.length >= 1) {
			//Set thisId to a random game code that is unused
			var thisId = generateGameCode();

			//Get the player to play against
			var player2 = randPlayQueue[0];

			//Setup a game
			games[thisId] = {};

			//Setup player 1 or the p1 player
			games[thisId].p1 = {
				"socketId" : socket.id,
				"myTurn" : false,
			};

			//Setup player 2 or the p2 player
			games[thisId].p2 = {
				"socketId" : player2,
				"myTurn" : false,
			};

			//Add both users to the userToGame object
			userToGame[socket.id] = thisId;
			userToGame[player2] = thisId;

			//Remove the player that we just made a game with
			//delete randPlayQueue[0];

			randPlayQueue.shift();

			//Tell p2 that p1 has joined
			socket.to(player2).emit('otherJoined');

			//Tell p1 that p2 is ready
			socket.emit('otherJoined')

			//Set workingGame to the current game we are working on
			var workingGame = games[thisId];

			//Setup things for looking up a socket id and turning it into p1 or p2
			workingGame[socket.id] = "p1";
			workingGame[player2] = "p2";

			//Generate a random number 0 or 1
			workingGame.currentTurn = Math.round(Math.random());

			//Define markCount so we can count the number of marks
			workingGame.markCount = 0;

			//Define winner so we can tell if there is a winner or tie
			workingGame.winner = null;

			//Create an empty board
			workingGame.board = Array.apply(null, Array(9)).map(function (x, i) { return null; });

			//Send the original random number to p1
			socket.emit("startPlayerData", workingGame.currentTurn);

			//Send the opposite of the random number to p2
			socket.to(player2).emit("startPlayerData", (workingGame.currentTurn == 0 ? 1 : 0));

			//Set the myTurn option of both player 1 and player 2
			workingGame.p1.myTurn = (workingGame.currentTurn == 0 ? true : false);
			workingGame.p2.myTurn = (workingGame.currentTurn == 1 ? true : false);

			//Tell the client that the game code has been generated and accepted
			socket.emit(`recvGameCode`, thisId, 0);

			//Tell the client that the game code has been generated and accepted
			socket.to(player2).emit(`recvGameCode`, thisId, 0);

			console.log("Other player: " + otherPlayer(socket, thisId, 1));
		}else { //This runs when there is no one in in the queue
			//Add user to random player queue
			randPlayQueue[randPlayQueue.length] = socket.id;
		}
	});

	//This code runs when a user places a marker
	socket.on("placedMark", (loc) => {
		//Get this games game id from the users socket id
		var gameId = userToGame[socket.id];

		//If gameId is undefined that means the game doesn't exist
		if (gameId == undefined) return;

		//If there is a winner then ignore this event
		if (games[gameId].winner != null) return;

		//Set thisGame to the game that this user is in
		var thisGame = games[gameId];

		//If there is a marker in the location that a user wants to place their marker then ignore the users request
		if (thisGame.board[loc] != null) return;

		//Set currentTurn to the current turn of this game which is either "p1" or "p2"
		var currentTurn = thisGame[socket.id];

		//If it isn't a players turn then exit the function
		if (!thisGame[currentTurn].myTurn) return;
		
		//Place the current users respective marker down in the board
		thisGame.board[loc] = (currentTurn == "p1" ? 0 : 1);

		//Change the currentTurn
		thisGame.currentTurn = (thisGame.currentTurn == 0 ? 1 : 0);

		//Change the var myTurn of both players so basically switch who can place a marker
		thisGame[currentTurn].myTurn = !thisGame[currentTurn].myTurn;
		thisGame[(currentTurn == "p1" ? "p2" : "p1")].myTurn = !thisGame[(currentTurn == "p1" ? "p2" : "p1")].myTurn;

		//Add one to the markCount because a mark was placed
		thisGame.markCount += 1;

		//Tell the other player that the current player made a mark
		socket.to(otherPlayer(socket, gameId, 1)).emit("otherMadeMark", loc);

		//Check for a winner if there is one then set winnerExist to true
		var winnerExist = checkForWinner(gameId);

		//If there is a winner then delete the game
		if (winnerExist) {
			//Delete the game
			deleteGame(gameId, socket);
		}
	});

	//Check the clients game id
	socket.on(`myIdIs`, (playersId) => {
		if (!doesIdExist(playersId)) socket.emit("invalidCode");
	});
});

//Listen on port 3000
http.listen(port, () => console.log(`Example app listening on port ${port}!`));

//Define a function to generate a random 8 character id
function genShortId() {
	var ALPHABET = '0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ';

	var ID_LENGTH = 8;

	var rtn = '';
	for (var i = 0; i < ID_LENGTH; i++) {
		rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
	}
	return rtn;
};

//Define a function which sends data to both socket ids in a game
function sendDataToBoth(name, data, socket, id) {
	socket.emit(name, data);
	socket.to(games[id][(games[id][socket] == "p1" ? "p2" : "p1")].socketId).emit(name, data);
}

//Return the other players socket id
function otherPlayer(socket, id, gameScope, isDisconnect) {
	//If the type of otherPlayer has isDisconnect set to true then find the other player but without using their sockets just using their socket id
	if (isDisconnect) {
		if (gameScope == 0) return tempGames[id][(tempGames[id][socket] == "p1" ? "p2" : "p1")].socketId;
		return games[id][(games[id][socket] == "p1" ? "p2" : "p1")].socketId;
	}

	//If isDisconnect is false then these lines run
	if (gameScope == 0) return tempGames[id][(tempGames[id][socket.id] == "p1" ? "p2" : "p1")].socketId;
	return games[id][(games[id][socket.id] == "p1" ? "p2" : "p1")].socketId;
}

//Check if some text contains any number of profane words if so return true otherwise return false
function isProfane(text) {
	return Object.keys(p.getWordCounts(text)).length == 0 ? false : true;
}

//Check if a game id exists
function doesIdExist(id) {
	return (games.hasOwnProperty(id) || tempGames.hasOwnProperty(id));
}

//Check for a winner or tie
function checkForWinner(gameId) {
	//Set thisGame to the game for the gameId
	var thisGame = games[gameId];
	
	//Set winner to null because we don't have a valid winner yet
	var winner = null;
	
	//Check rows
	for (var i = 0; i < 3; i++) {
		//Check if the current row is a wining row
		if (thisGame.board[0 + (i * 3)] == thisGame.board[2 + (i * 3)] && thisGame.board[1 + (i * 3)] == thisGame.board[0 + (i * 3)] && !anyNull(0, i, thisGame)) {
			//Set the winner
			winner = thisGame.board[0 + (i * 3)];

			//Break out of the loop because we have found a winner
			break;
		}
	}

	//Check columns
	for (var i = 0; i < 3; i++) {
		if (thisGame.board[0 + i] == thisGame.board[3 + i] && thisGame.board[6 + i] == thisGame.board[0 + i] && !anyNull(1, i, thisGame)) {
			//Set the winner
			winner = thisGame.board[0 + i];

			//Break out of the loop because we have found a winner
			break;
		}
	}
	
	//Check diagonals
	if (thisGame.board[0] == thisGame.board[4] && thisGame.board[8] == thisGame.board[0] && !anyNull(2, i, thisGame)) {
		//Set the winner
		winner = thisGame.board[0];
	}else if (thisGame.board[2] == thisGame.board[4] && thisGame.board[6] == thisGame.board[2] && !anyNull(3, i, thisGame)) {
		//Set the winner
		winner = thisGame.board[2];
	} 

	//Check if their is a winner
	if (winner != null) {
		//Log who the winner is
		console.log(`Winner: ${winner == 0 ? "X" : "O"}`);

		//Set the winner in the thisGame
		thisGame.winner = winner;
		
		//Exit the function since we found a ended game case and don't need to waste time on checking for a tie
		return true;
	}

	//Check if 9 marks have been placed
	if (thisGame.markCount == 9) {
		//Log that the game is a tie
		console.log("Tie!");

		//Set winner to true to represent a tie
		thisGame.winner = true;

		return true;
	}
}

//Check if a row column or diagonal contains any null positions
function anyNull(winDir, index, curGame) {
	//Based on if the win is a row column or diagonal we need to do different math so we check
	if (winDir == 0) {
	  return (curGame.board[index * 3] == null && curGame.board[1 + (index * 3)] == null && curGame.board[2 + (index * 3)] == null);
	}else if (winDir == 1) {
	  return (curGame.board[index] == null && curGame.board[3 + index] == null && curGame.board[6 + index] == null);
	}else if (winDir == 2) {
	  return (curGame.board[0] == null && curGame.board[4] == null && curGame.board[8] == null);
	}else if (winDir == 3) {
	  return (curGame.board[2] == null && curGame.board[4] == null && curGame.board[6] == null);
	}
}

function createTempGame(socket) {
	//Set thisId to a random unused game code
	var thisId = generateGameCode();

	//We set doesExist to false because we have found a game id that doesn't exist
	doesExist = false;

	//Set tempGames at the generated id to a empty json object
	tempGames[thisId] = {};

	//Set the socket id for a game to p1
	tempGames[thisId][socket.id] = "p1";

	//Setup the p1 player
	tempGames[thisId].p1 = {
		"socketId" : socket.id,
		"myTurn" : false,
	};

	//Create an empty board
	tempGames[thisId].board = Array.apply(null, Array(9)).map(function (x, i) { return null; });

	//Add the user to the userToGame object
	userToGame[socket.id] = thisId;

	return thisId;
}

function generateGameCode() {
	//Set doesExist to true
	var doesExist = true;

	//Keep generating short id codes until we get one that hasn't been used
	while (doesExist) {
		//Generate short game id
		var thisId = genShortId();

		//Check if the game code generated contains profane words if so skip that game code
		if (!isProfane(thisId)) {
			//If the game code generated hasn't been used and isn't profane then we continue
			if (!doesIdExist(thisId)) {
				//We set doesExist to false because we have found a game id that doesn't exist
				doesExist = false;
				
				//Return the game id
				return thisId;
			}
		}
	}
}

//Delete a game
function deleteGame(gameId, thisPlayer, isDisconnect) {
	//Delete the other player from the user to game object
	delete userToGame[otherPlayer(thisPlayer, gameId, 1, isDisconnect)];
	
	//Delete a player from the user to game object
	delete userToGame[thisPlayer.id];

	//Delete the game a player is part of
	delete games[gameId];
}
