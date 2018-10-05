
var express = require("express")
var mongoose = require("mongoose")
var bodyParser = require("body-parser")

var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)

var conString = "mongodb://127.0.0.1:27017/meanchatappdb";
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	next();
  });
mongoose.Promise = Promise

// Model for chats
var Chats = mongoose.model("Chats", {
    name: String,
    chat: String
})

// connecting to mongodb using mongoose
mongoose.connect(conString, { useMongoClient: true }, (err) => {
    console.log("Database connection", err)
})

// save a new chat message in database
app.post("/chats", async (req, res) => {
    try {
        var chat = new Chats(req.body)
        await chat.save()
        res.sendStatus(200)
        //Emit the event
        io.emit("chat", req.body)
    } catch (error) {
        res.sendStatus(500)
        console.error(error)
    }
})

// Get chat messages from detabase and return to client
app.get("/chats", (req, res) => {
    Chats.find({}, (error, chats) => {
        res.send(chats)
    })
})

// clear method for clearing the chats
app.post("/clear", function(){
    // Remove all chats from collection
    Chats.remove({}, function(){
        io.emit('cleared');
    });
})

// io will listen for the connection event 
io.on("connection", (socket) => {
    console.log("Socket is connected...")
})

//server will start listening for request
var server = http.listen(3111, () => {
    console.log("Well done, now I am listening on ", server.address().port)
})