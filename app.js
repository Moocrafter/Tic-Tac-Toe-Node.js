const fs = require('fs');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var serveStatic = require('serve-static')
const port = 3000


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
	var data = fs.readFileSync(`./public/index.html`).toString();
	res.write(data);
	res.write(`<script id="remove">startWithId(${req.params.id});document.getElementById("remove").outerHTML = "";</script>`)
	res.end();
});

//Runs on socket connection
io.on('connection', (socket) => {
	//Log that a user connected
	console.log('a user connected');

	//When a user disconnects log it
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on(`getGameCode`, (type) => {
		var thisId = shortid.generate();
		console.log(thisId);

		socket.emit(`recvGameCode`, thisId, type);
	});
});

//Listen on port 3000
http.listen(port, () => console.log(`Example app listening on port ${port}!`))

var shortid = {
	"generate" : () => {
		var ALPHABET = '0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ';

		var ID_LENGTH = 8;

		var rtn = '';
		for (var i = 0; i < ID_LENGTH; i++) {
			rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
		}
		return rtn;
	}
};