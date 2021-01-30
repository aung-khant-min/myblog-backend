const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
dotenv.config() 

const verifyToken = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.status(400).send({ info: 'TOKEN NOT PROVIDED' })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        req.author = { authorid: decoded.authorid, authorname: decoded.authorname }
        //console.log(new Date(decoded.exp * 1000).toUTCString())
        next();
    } catch (err) {
        return res.status(400).send({ info: 'AUTHENTICATION FAILED' })
    }
}

module.exports = {
    verifyToken,
}