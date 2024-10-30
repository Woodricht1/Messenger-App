const express = require('express');
const router = express.Router();
const User = require('./models.js');
const password = require('./password.js');

router.get('/signup', (req, res) => {
    res.render('signup')
})

router.post('/signup', async (req, res) => {
    if (!req.body.id || !req.body.password) {
        res.render('signup', {message: "Error: user id or password not entered"})
        return
    }

    const user = await User.findOne({'id': req.body.id}, 'id password')

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

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    if(!req.body.id || !req.body.password) {
        res.render('login', {message: "Error: user id or password not entered"})
        return
    }

    const user = await User.findOne({'id': req.body.id}, 'id password')

    console.log("<Login> Find: ", req.body.id)
    if (user === undefined || user === null || req.body.password != user.password) {
        res.render('login', {message: "Invalid credentials"})
        return
    } else {
        req.session.user = user
        res.redirect('/protected_page')
        return
    }
})

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

router.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', {id: req.session.id})
})

module.exports = router;