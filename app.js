// [LOAD PACKAGES]
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var dotEnv      = require('dotenv').config();

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongo database server");

});

mongoose.connect('mongodb://localhost:27017/manhattan', { useNewUrlParser: true });

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", require("./src/routes/index"))

var port = process.env.PORT || 3000;

// [RUN SERVER]
var server = app.listen(port, function(){
    console.log("Express server has started on port: what is going on? " + port)
});