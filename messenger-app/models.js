const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    salt: String,
    hashedPassword: String,
    email: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
})

const User = mongoose.model('user', userSchema)

const groupSchema = mongoose.Schema({
    name: String,
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
})

const Group = mongoose.model('group', groupSchema)

const messageSchema = mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'User'} || {type: mongoose.Schema.Types.ObjectId, ref: 'Group'} || [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    message: String,
    timestamp: Date
})

const Message = mongoose.model('message', messageSchema)

module.exports = User, Group, Message;