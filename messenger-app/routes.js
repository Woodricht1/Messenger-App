const express = require('express');
const router = express.Router();
const User = require('./models.js');
const password = require('./password.js');


//signup page
router.get('/signup', (req, res) => {
    res.render('signup')
})

//handle signup request
router.post('/signup', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.render('signup', {message: "Error: username or password not entered"})
        return
    }

    const user = await User.findOne({'username': req.body.username}, 'id password')
    console.log(`Found user: ${user}`)
    console.log("<Signup> Find: ", req.body.username)
    if (user === undefined || user === null) {
        const salt = password.generateSalt();
        const hashedPassword = password.hashPassword(req.body.password, salt);
        var newUser = new User({
            username: req.body.username,
            salt: salt,
            hashedPassword: hashedPassword
        })
        newUser.save()
        req.session.user = newUser
        res.redirect('/protected_page')
        return
    } else {
        res.render('signup', {message: "Error: an account with this user id already exists"})
        return
    }
})

//login page
router.get('/login', (req, res) => {
    res.render('login')
})

//handle login request
router.post('/login', async (req, res) => {
    if(!req.body.username || !req.body.password) {
        res.render('login', {message: "Error: username or password not entered"})
        return
    }
    //TODO fix this in signup post as well
    const user = await User.findOne({'username': req.body.username}, 'username salt hashedPassword')
    //console.log(`Found user: ${user}`)
    //console.log("<Login> Find: ", req.body.username)
    const salted_input_pass = password.hashPassword(req.body.password, user.salt)
    if (user === undefined || user === null || (salted_input_pass !== user.hashedPassword)) {
        res.render('login', {message: "Invalid credentials"})
        return
    } else {
        req.session.user = user
        res.redirect('/protected_page')
        return
    }
});

//logout page
router.get('/logout', (req, res) => {
    let user = req.session.id
    req.session.destroy(() => {
        console.log(`${user} logged out.`)
    })
    res.redirect('/login')
})

const checkSignIn = (req, res, next) => {
    if(req.session.user) {
        return next()
    } else {
        const err = new Error("Not logged in")
        err.status = 400
        return next(err)
    }
}

//redirect to login if not signed in
router.use('/protected_page', (err, req, res, next) => {
    res.redirect('/login')
})

//render protected page
router.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', {username: req.session.user.username})
})

module.exports = router;