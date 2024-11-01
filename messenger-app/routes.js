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
        res.render('signup', {message: "Error: username or password not entered."})
        return
    }

    const user = await User.findOne({'username': req.body.username}, 'username salt hashedPassword')
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
        res.render('signup', {message: "Error: an account with this username already exists."})
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
        res.render('login', {message: "Error: username or password not entered."})
        return
    }
    const user = await User.findOne({'username': req.body.username}, 'username salt hashedPassword')
    //console.log(`Found user: ${user}`)
    //console.log("<Login> Find: ", req.body.username)
    
    if (user === undefined || user === null) {
        res.render('login', {message: "Error: Invalid credentials. Please try again."})
        return
    } else {
        const salted_input_pass = password.hashPassword(req.body.password, user.salt)
        if (salted_input_pass !== user.hashedPassword) {
            res.render('login', {message: "Error: Invalid credentials. Please try again."})
            return
        }
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

router.get('/edit_username', (req, res) => {
    res.render('edit_username', {username: req.session.user.username});
});

router.post('/edit_username', async (req, res) => {
    const filter = { username: req.session.user.username };
    const update = { username: req.body.username };
    const newUsername = req.body.username;
    const updatedUser = await User.findOneAndUpdate(filter, update, { new: true });
    res.render('protected_page', {username: newUsername})
})

router.get('/edit_password', (req, res) => {
    res.render('edit_password', {username: req.session.user.username});
});

router.post('/edit_password', async (req, res) => {
    const filter = { username: req.session.user.username };
    const newPassword = req.body.password;
    const salt = password.generateSalt();
    const hashedPassword = password.hashPassword(newPassword, salt);
    const update = {
        hashedPassword: hashedPassword,
        salt: salt
    };
    const updatedUser = await User.findOneAndUpdate(filter, update, { new: true });
    res.redirect('protected_page')
})

const checkSignIn = (req, res, next) => {
    if(req.session.user) {
        return next()
    } else {
        // const err = new Error("Not logged in")
        // err.status = 400
        // return next(err)
        res.redirect('/login');
    }
}

//render protected page
router.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', {username: req.session.user.username})
})

module.exports = router;