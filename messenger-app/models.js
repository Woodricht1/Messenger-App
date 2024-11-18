const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    salt: String,
    hashedPassword: String
})

const User = mongoose.model('user', userSchema)

const groupSchema = mongoose.Schema({
    name: String,
    members: [User]
})

const Group = mongoose.model('group', groupSchema)

const messageSchema = mongoose.Schema({
    sender: User,
    recipient: User || Group || [User],
    message: String,
    timestamp: Date
})

const Message = mongoose.model('message', messageSchema)

module.exports = User, Group, Message;