const sha256 = require('sha256')

/**
 * Generates a random 6-character string to be used as a salt
 * THIS NEEDS TO BE STORED ALONG WITH THE HASHED PASSWORD
 * @returns {String} consisting of 6 randomly generated characters
 */
const generateSalt = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    var result = ""
    for (i = 0; i < 6; i++) {
        result += chars.at(Math.floor(Math.random() * 36))
    }
    return result
}

/**
 * Hashes a salted password to include in the user's account entry in the DB
 * @param {String} password     The user's chosen account password
 * @param {String} salt         A randomly generated salt
 * @returns {String}            The hashed version of the salted password
 */
const hashPassword = (password, salt) => {
    const saltedPassword = password + salt
    return sha256(saltedPassword)
}

module.exports = {generateSalt, hashPassword}