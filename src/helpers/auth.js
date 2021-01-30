const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
dotenv.config()

const isEmpty = (arg) => {
    if (arg === undefined || arg === '') {
        return true
    }
    if (arg.replace(/\s/g, '').length) {
        return false
    }
    return true
}

const validatePassword = (password) => {
    if (isEmpty(password)) {
        return false
    }
    if (password.replace(/\s/g, '').length < 6) {
        return false
    }

    return true
}

const generateToken = (authorid, authorname) => {
    const token = jwt.sign({ authorid, authorname }, process.env.SECRET, { expiresIn: '7d' })
    return token
}


module.exports = {
    isEmpty,
    validatePassword,
    generateToken,
}