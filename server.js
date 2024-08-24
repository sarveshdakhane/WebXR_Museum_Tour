const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

https.createServer(options, app).listen(3000, () => {
  console.log('Server running at https://localhost:3000/');
});
