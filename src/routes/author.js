const dbQuery = require('../utils/dbQuery')
const router = require('express').Router()

const { isEmpty, validatePassword, generateToken } = require('../helpers/auth')
const { verifyToken } = require('../middleware/auth')

router.post('/author/login',
    async (req, res) => {
        const { authorname, password } = req.body

        if(isEmpty(authorname)) {
            return res.status(400).send({ info: 'Invalid Username' })
        }

        if (!validatePassword(password)) {
            return res.status(400).send({ info: 'Invalid Password ' })
        }

        const query = 'SELECT * FROM author WHERE authorname=$1'
        const values = [authorname]

        try {
            const { rows } = await dbQuery(query, values)
            const dbResponse = rows[0]

            if (!dbResponse) {
                return res.status(400).send({ info: 'User Not Found' })
            }

            if (password !== dbResponse.password) {
                return res.status(400).send({ info: 'Incorrect Password' })
            }

            delete dbResponse.password
            const token = generateToken(dbResponse.authorid,dbResponse.authorname)

            return res.status(200).json({ token })
        } catch (err) {
            return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
        }
    }
)

router.get('/author',
    verifyToken,
    async (req, res) => {

        const { authorname } = req.author

        try {
            return res.status(200).json({ authorname })
        } catch (err) {
            console.log(err)
            if (err) {
                return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
            }
        }
    })


module.exports = router 