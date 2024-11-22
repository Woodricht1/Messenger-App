const express = require('express');
const router = express.Router();
const User = require('./models.js');
const password = require('./password.js');
const email = require('./email.js');
const dbname = "MessangerAppDB";
const { MongoClient, CancellationToken } = require('mongodb')

router.get('/', (req,res) => {
    res.render('start')
})

router.post('/start', (req, res) => {
    
})

//signup page
router.get('/signup', (req, res) => {
    res.render('signup')
})

router.get('/index', (req, res) => {
    res.render('index')
})

router.post('/index', (req, res) => {
    res.send('Form successfully submitted!');
  });

router.get('/email', (req, res) => {
    res.render('email')
});

router.post('/email', async (req, res) => {
    token = req.body.token;
    console.log(token)
    const user = await User.findOne({verificationToken: token});

    if (!user) {
        return res.render('email', {message: 'Invalid authentication code'});
    }

    user.isVerified = true;
    user.verificationToken = null;

    res.redirect('/app');
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
        const token = email.generateVerificationToken();
        var newUser = new User({
            username: req.body.username,
            salt: salt,
            hashedPassword: hashedPassword,
            email: req.body.email,
            verificationToken: token
        })
        newUser.save()
        req.session.user = newUser
        await email.sendVerificationEmail(req.session.user, token);
        res.redirect('/email')
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
    console.log(`Found user: ${user}`)
    console.log("<Login> Find: ", req.body.username)
    
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
        res.redirect('/app')
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
    res.render('app', {username: newUsername})
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
    res.redirect('app')
})

const checkSignIn = (req, res, next) => {
    if(req.session.user) {
        return next()
    } else {
        // const err = new Error("Not logged in")
        // err.status = 400
        // return next(err)
        res.redirect('/');
    }
}

//render app page
router.get('/app', checkSignIn, (req, res) => {
    res.render('app', {username: req.session.user.username})
})


// Delete Account
router.post('/drop_user', checkSignIn, async (req, res) => {
    const usernameToDrop = req.body.username; // Accessing the username from the form submission

    const client = new MongoClient("mongodb+srv://woodricht1:NDFW7ozsyYcUIf0i@messangerappdb.mudq3.mongodb.net/MessangerAppDB?retryWrites=true&w=majority&appName=MessangerAppDB");

    try {
        await client.connect();
        const db = client.db(dbname);

        // Delete the user from the users collection
        const result = await db.collection('users').deleteOne({ username: usernameToDrop });

        if (result.deletedCount === 1) {
            console.log(`User ${usernameToDrop} dropped successfully.`);
            res.redirect('/login'); // Redirect after successful deletion
        } else {
            console.error(`User ${usernameToDrop} not found.`);
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error dropping user:", error);
        res.status(500).send("Error dropping user.");
    } finally {
        await client.close();
    }
});



module.exports = router;