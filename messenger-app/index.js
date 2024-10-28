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
const User = require('./models.js')
const port = process.env.PORT || 3000

app.set('view engine', 'pug')
app.set('views', './views')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(upload.array())
app.use(cookieParser())
app.use(session({secret: "Mellon"}))

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

app.use('/', async (req, res, next) => {
    const allUsers = await User.find({}, 'id password')
    console.log("Registered users:")
    for (const user of allUsers) {
        console.log(`${user.id}`)
    }
    currentUser = (req.session.user) ? req.session.user.id : null
    if (currentUser) {
        console.log(`Current user: ${currentUser}`)
    } else {
        console.log("Current user: Not set")
    }
    next()
})

const routes = require('./routes.js')
app.use('/', routes)

app.use('/protected_page', (err, req, res, next) => {
    res.redirect('/login')
})

app.listen(port, () => {
    console.log(`Cookie app listening on port ${port}`);
})