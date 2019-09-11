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
app.use(serveStatic('public/static'))

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

//Listen on port 3000
http.listen(port, () => console.log(`Example app listening on port ${port}!`))