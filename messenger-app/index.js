/*
    NOTE: I do not include the middleware to handle the users array, 
    since I use persistent storage in MongoDB instead of an array.
*/

const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()
const session =require('express-session')
const cookieParser = require('cookie-parser')
const app = express()
const models = require('./models.js')
const port = process.env.PORT || 3000

const { join } = require('node:path');
const { createServer } = require('http'); // To create an HTTP server
const { Server } = require('socket.io'); // Import Server from socket.io
const server = createServer(app); // Create an HTTP server
const io = new Server(server); // Pass the HTTP server instance to socket.io


app.set('view engine', 'pug')
app.set('views', './views')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(upload.array())
app.use(cookieParser())
app.use(session({secret: "Mellon"}))
app.use(express.static('views/css'));
app.use(express.static('views/branding'))

const username = "woodricht1"
const password = "NDFW7ozsyYcUIf0i"
const cluster = "messangerappdb.mudq3"
const dbname = "MessangerAppDB"

const uri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority&appName=MessangerAppDB`

const mongoose = require('mongoose')
const mongoose_settings = {}

mongoose.connect(uri, mongoose_settings)
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error: "))
db.once("open", () => {
    console.log("Connected successfully to MongoDB")
})

app.use('/static', express.static('static'));


app.use('/', async (req, res, next) => {
    const allUsers = await models.User.find({}, 'username salt hashedPassword')
    // console.log("Registered users:")
    // for (const user of allUsers) {
    //     console.log(`username ${user.username}, id ${user._id}`)
    // }
    currentUser = (req.session.user) ? req.session.user.username : null
    if (currentUser) {
        console.log(`Current user: ${currentUser}`)
    } else {
        //console.log("Current user: Not set")
    }
    next()
})

let MessageStream = models.Message.watch([{ $match: {operationType: {$in: ['insert']}}}])

io.on('connection', (socket) => {
    console.log("A user connected");

    socket.on('disconnect', () => {
        console.log('user disconnected')
    });

    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
    });

    MessageStream.on('change',async function(change){ //if messages DB changes, that means a new message has shown up

        //populate details of sender (since this is a nested obejct it is not automatically populated)
        const senderDetails = await models.User.findById(change.fullDocument.sender).select('username');

        if (senderDetails) {
            change.fullDocument.sender = {
                _id: senderDetails._id,
                username: senderDetails.username
            };
        }

        socket.emit('messageStreamChange', change);
    })

});

const routes = require('./routes.js')
app.use('/', routes)

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });