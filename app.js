const fs = require('fs');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var serveStatic = require('serve-static');
var Profane = require('profane');
var p = new Profane();
const port = 3000;

var games = {};
var tempGames = {};
var userToGame = {};

//GET / and send it to the user
app.get('/', (req, res) => {
	var data = fs.readFileSync(`./public/index.html`).toString();
	res.write(data);
	res.end();
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
	console.log('a user connected');

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

			//Send the opposite of the random number to p2
			socket.emit("startPlayerData", (workingGame.currentTurn == 0 ? 1 : 0));

			//Send the original random number to p1
			socket.to(otherPlayer(socket, thisId, 1)).emit("startPlayerData", workingGame.currentTurn);

			workingGame.p1.myTurn = (workingGame.currentTurn == 0 ? true : false);
			workingGame.p2.myTurn = (workingGame.currentTurn == 1 ? true : false);
		}
	}

	//When a user disconnects log it
	socket.on('disconnect', () => {
		console.log('user disconnected');

		//If a player is starting a game or is in a game and disconnects then notify the other player and remove the game
		console.log(`This socket id: ${socket.id}\nuserToGame: ${JSON.stringify(userToGame)}`);
		//If the user is part of a game or tempGame then notify the other player
		if (userToGame.hasOwnProperty(socket.id)) {
			//Define the playerSocketId var because after a while we lose the players socket id
			var playerSocketId = socket.id;

			//Get this players game id
			var thisId = userToGame[playerSocketId];

			//If the player who disconnected is in an active otherwise its in a tempGame
			if (games.hasOwnProperty(thisId)) {
				//Set thisPlayer to p1 or p2 based on if they are p1 or p2
				var thisPlayer = games[thisId][playerSocketId];

				//Based on this player being p1 or p2 pick the opposite player side
				var otherPlayer = (thisPlayer == "p1") ? "p2" : "p1";

				//Send the other player a message that this player disconnected
				socket.to(games[thisId][(games[thisId][playerSocketId] == "p1" ? "p2" : "p1")].socketId).emit(`otherPlayerLeft`, ``);
				
				//Remove the other player from the userToGame object from the context of games
				delete userToGame[games[thisId][(games[thisId][playerSocketId] == "p1" ? "p2" : "p1")].socketId];
				console.log(`This socket id: ${playerSocketId}\nSocket id removed: ${JSON.stringify(games[thisId][(games[thisId][playerSocketId] == "p1" ? "p2" : "p1")])}`);
				//Delete the game
				delete games[thisId];
			}else {
				//If there are more than two players in a tempGame than send a disconnect messgae
				if (Object.keys(tempGames[thisId]).length > 2) socket.to(tempGames[thisId][(tempGames[thisId][playerSocketId] == "p1" ? "p2" : "p1")].socketId).emit(`otherPlayerLeft`, ``);
			
				//Remove the other player from the userToGame object from the context of tempGames
				delete userToGame[tempGames[thisId][(tempGames[thisId][playerSocketId] == "p1" ? "p2" : "p1")]];

				//Delete the temporary game
				delete tempGames[thisId];
			}

			//Delete the old user from the userToGame object
			delete userToGame[playerSocketId];
		}
	});

	//When a user wants to get a new game code generate one and set up a temp game
	socket.on(`getGameCode`, (type) => {
		//Set doesExist to true
		var doesExist = true;

		//Keep generating short id codes until we get one that hasn't been used
		while (doesExist) {
			//Generate short game id
			var thisId = genShortId();

			//Check if the game code generated contains profane words if so skip that game code
			if (!isProfane(thisId)) {
				//If the game code generated hasn't been used than set doesExist to false
				if (!doesIdExist(thisId)) {
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

					tempGames[thisId].board = Array.apply(null, Array(9)).map(function (x, i) { return null; });

					//Add the user to the userToGame object
					userToGame[socket.id] = thisId;
					console.log(tempGames);

					//Tell the client that the game code hs been generated and accepted
					socket.emit(`recvGameCode`, thisId, type, true);
				}
			}
		}
	});

	//This code runs when a user places a marker
	socket.on("placedMark", (loc) => {
		//Get this games game id from the users socket id
		var gameId = userToGame[socket.id];

		//Set thisGame to the game that this user is in
		var thisGame = games[gameId];

		//If there is a marker in the location that a user wants to place their marker then ignore the users request
		if (thisGame.board[loc] != null) return;

		//Set currentTurn to the current turn of this game which is either "p1" or "p2"
		var currentTurn = (thisGame[socket.id]);

		//Check if the user who is trying to place a mark is currently allowed to place a mark
		if (thisGame[currentTurn].myTurn) { //If it is their turn then continue
			//Place the current users respective marker down in the board
			thisGame.board[loc] = (currentTurn == "p1" ? 0 : 1);

			//Change the currentTurn
			thisGame.currentTurn = (thisGame.currentTurn == 0 ? 1 : 0);

			//Change the var myTurn of both players so basically switch who can place a marker
			thisGame[currentTurn].myTurn = !thisGame[currentTurn].myTurn;
			thisGame[(currentTurn == "p1" ? "p2" : "p1")].myTurn = !thisGame[(currentTurn == "p1" ? "p2" : "p1")].myTurn;
		}
	});

	//Check the clients game id
	socket.on(`myIdIs`, (playersId) => {
		if (!doesIdExist(playersId)) socket.emit("invalidCode");
	});
});

//Listen on port 3000
http.listen(port, () => console.log(`Example app listening on port ${port}!`));

var genShortId = () => {
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
function otherPlayer(socket, id, gameScope) {
	if (gameScope == 0) return tempGames[id][(games[id][socket] == "p1" ? "p2" : "p1")].socketId;
	else return games[id][(games[id][socket] == "p1" ? "p2" : "p1")].socketId;
}

//Check if some text contains any numebr of profane words if so return true otherwise return false
function isProfane(text) {
	return Object.keys(p.getWordCounts(text)).length == 0 ? false : true;
}

//Check if a game id exists
function doesIdExist(id) {
	return (games.hasOwnProperty(id) || tempGames.hasOwnProperty(id));
}