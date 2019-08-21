const fs = require('fs');
var serveStatic = require('serve-static')
var express = require('express')
const app = express()
const port = 3000

//GET / and send it to the user
app.get('/', (req, res) => {
	var data = fs.readFileSync(`./public/index.html`).toString();
	res.write(data);
	res.end();
});

//Serve static files
app.use(serveStatic('public/static'));

//Listen on port 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))