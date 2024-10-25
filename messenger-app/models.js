const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    salt: String,
    hashedPassword: String
})

const User = mongoose.model('user', userSchema)

module.exports = User;