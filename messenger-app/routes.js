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
    if (!req.body.id || !req.body.password) {
        res.render('signup', {message: "Error: user id or password not entered"})
        return
    }

    const user = await User.findOne({'username': req.body.id}, 'id password')
    console.log(`Found user: ${user}`)
    console.log("<Signup> Find: ", req.body.id)
    if (user === undefined || user === null) {
        const salt = password.generateSalt();
        const hashedPassword = password.hashPassword(req.body.password, salt);
        var newUser = new User({
            username: req.body.id,
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
    if(!req.body.id || !req.body.password) {
        res.render('login', {message: "Error: user id or password not entered"})
        return
    }
    //TODO fix this in signup post as well
    //TODO dehash password so the conditional succeeds
    const user = await User.findOne({'username': req.body.id}, 'username hashedPassword')
    console.log(`Found user: ${user}`)
    console.log("<Login> Find: ", req.body.id)
    const salted_input_pass = password.hashPassword(req.body.password, user.salt)
    console.log(` user.salt ${ user.salt}`)
    console.log(`IN: ${salted_input_pass}`)
    console.log(`OUT ${user.hashedPassword}`)
    if (user === undefined || user === null || salted_input_pass != user.hashedPassword) {
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

//render protected page
router.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', {id: req.session.id})
})

module.exports = router;