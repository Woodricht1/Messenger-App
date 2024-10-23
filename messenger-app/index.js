const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const BodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const session = require('express-session')
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Mellon"}));

const uname = "weaverg7";
const pword = "6Sr0yiwLb5RMonsJ";
const cluster = "cluster0.awlhm";
const dbname = "test";

const url = `mongodb+srv://${uname}:${pword}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;

const mongoose = require('mongoose');
const mongoose_settings = {useNewUrlParser: true};

mongoose.connect(url, mongoose_settings);
const dbconn = mongoose.connection;
dbconn.on("error", console.error.bind(console, "connection error: "));
dbconn.once("open", () => {
    console.log("Connected successfully to MongoDB");
});

const userSchema = {
    id: String,
    password: String,
};

const User = mongoose.model("User", userSchema);

app.use(async (req, res, next) => {
    try {
        // Fetch all users from the database
        const allUsers = await User.find().select('id');
        let cur_users = allUsers.map(user => user.id).join(' ');
        console.log("Registered users:", cur_users);
        if (req.session.user) {
            console.log(`Current user: ${req.session.user.id}`);
        } else {
            console.log("Current user: Not set");
        }
    } catch (err) {
        console.error("Error fetching users:", err);
    }

    next();
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    if (!req.body.id || !req.body.password) {
        res.render('signup', {message: "Please enter both id and password!"});
        return;
    };

    let user = User.find({ id: req.body.id});

    console.log("<Signup> Find: ", user);
    if (user === undefined || user === null) {
        const newUser = new User({
            id: req.body.id,
            password: req.body.password,
        });
        db.users.insertOne(newUser);
        req.session.user = newUser;
        res.redirect('/protected_page');
        return;
    } else {
        res.render('signup', {message: "User Already Exists! Login or chose another user id"});
        return;
    }
});

const checkSignIn = (req, res, next) => {
    if(req.session.user) {
        return next();
    } else {
        const err = new Error("Not logged in!");
        err.status = 400;
        return next(err);
    }
};

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    if(!req.body.id || !req.body.password) {
        res.render('login', {message: "Please enter both id and password"});
        return;
    }

    let user = User.findOne({ id: req.body.id, password: req.body.password});

    if (user === undefined || user === null) {
        res.render('login', {message: "Invalid credentials!"});
        return;
    } else {
        req.session.user = { id: user._id, username: user.username };
        res.redirect('/protected_page');
        return;
    }
})

app.get('/logout', (req, res) => {
    let user = req.session.user.id;
    req.session.destroy( () => {
        console.log(`${user} logged out.`)
    });
    res.redirect('/login');
});

app.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', {id: req.session.user.id});
});

app.use('/protected_page', (err, req, res, next) => {
    res.redirect('/login');
})

app.get('/', (req, res) => {
    res.cookie('name', 'express').send('cookie set'); //sets name = express
    console.log('Cookies: ', req.cookies);
});

app.get('/clear_cookie', function(req, res) {
    res.clearCookie('name');
    res.send('Cookie name cleared');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});