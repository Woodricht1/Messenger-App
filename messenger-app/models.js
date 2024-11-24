const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    salt: String,
    hashedPassword: String,
    email: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
})

const User = mongoose.model('User', userSchema)

const groupSchema = mongoose.Schema({
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Ensure ref points to the 'User' model
});

const Group = mongoose.model('Group', groupSchema)

const messageSchema = mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'User'} || {type: mongoose.Schema.Types.ObjectId, ref: 'Group'} || [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    message: String,
    timestamp: Date
})

const Message = mongoose.model('Message', messageSchema)

module.exports = User, Group, Message;