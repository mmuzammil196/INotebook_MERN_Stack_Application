const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const path = require('path');

connectToMongo();



 

const app = express()
const port = 5000

// json deal 
app.use(cors())
app.use(express.json())

// Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

// static files
app.use(express.static(path.join(__dirname, './client/build')));
app.get('*', function(req,res){
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.listen(port, () => {
  console.log(`INotebook app listening on port ${port}`)
})