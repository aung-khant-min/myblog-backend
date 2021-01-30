const dbQuery = require('../utils/dbQuery')
const router = require('express').Router()

const { verifyToken } = require('../middleware/auth')

router.get('/blog',
    async (req, res) => {

        const query = `SELECT blogid,slug,cover,title,tags,authorname,publishedat
         FROM blog WHERE ispublished=1`

        try {
            const { rows } = await dbQuery(query)
            const dbResponse = rows
            if (!dbResponse) {
                return res.status(400).send({ info: 'Blog Not Found' })
            }
            return res.status(200).json(dbResponse)
        } catch (err) {
            if (err) {
                return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
            }
        }

    }
)

router.get('/blog/:slug',
    async (req, res) => {

        const slug = req.params.slug
        const query = `SELECT blogid,slug,cover,title,tags,authorname,publishedat,body 
        FROM blog WHERE ispublished=1 and slug=$1`
        const values = [slug]

        if (!slug) {
            return res.status(400).send({ info: 'Data Required!' })
        }

        try {
            const { rows } = await dbQuery(query, values)
            const dbResponse = rows[0]
            if (!dbResponse) {
                return res.status(400).send({ info: 'Blog Not Found' })
            }
            return res.status(200).json({ ...dbResponse })
        } catch (err) {
            if (err) {
                return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
            }
        }

    }
)

//Author

router.get('/author/blog',
    verifyToken,
    async (req, res) => {

        const query = 'SELECT blogid,slug,title,createdat,publishedat,ispublished FROM blog'

        try {
            const { rows } = await dbQuery(query)
            const dbResponse = rows
            return res.status(200).json(dbResponse)
        } catch (err) {
            if (err) {
                return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
            }
        }

    }
)

router.get('/author/blog/:blogid',
    verifyToken,
    async (req, res) => {

        const blogid = req.params.blogid
        const query = 'SELECT * FROM blog WHERE blogid=$1'
        const values = [blogid]

        if (!blogid) {
            return res.status(400).send({ info: 'Data Required!' })
        }

        try {
            const { rows } = await dbQuery(query, values)
            const dbResponse = rows[0]
            if (!dbResponse) {
                return res.status(400).send({ info: 'Blog Not Found' })
            }
            return res.status(200).json({ ...dbResponse })
        } catch (err) {
            if (err) {
                return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
            }
        }

    }
)

router.post('/author/blog/new',
    verifyToken,
    async (req, res) => {

        const { authorname } = req.author
        const { title, slug, cover, tags, body, createdAt, createOrPublish } = req.body
        let query = ''
        let values = []
        let message = ''

        if (!(title && slug && cover && tags && body && createdAt && createOrPublish)) {
            return res.status(400).send({ info: 'Data Required!' })
        }

        if (createOrPublish === 'create') {
            query = `INSERT INTO blog(title,slug,cover,tags,body,createdat,authorname) 
            values($1,$2,$3,$4,$5,$6,$7) RETURNING blogid`
            values = [title, slug, cover, tags, body, createdAt, authorname]
            message = 'Your blog has been saved!'
        } else {
            query = `INSERT INTO blog(title,slug,cover,tags,body,createdat,authorname,publishedat,ispublished) 
            values($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING blogid`
            values = [title, slug, cover, tags, body, createdAt, authorname, createdAt, 1]
            message = 'Your blog has been published!'
        }

        try {
            const { rows } = await dbQuery(query, values)
            const dbResponse = rows[0]
            if (dbResponse.blogid) {
                return res.status(200).json({ info: message })
            } else {
                return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
            }
        } catch (err) {
            if (err.routine === '_bt_check_unique') {
                return res.status(400).send({ info: 'Blog title already in use!' })
            }
            return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
        }

    }
)

router.put('/author/blog/edit/:blogid',
    verifyToken,
    async (req, res) => {

        const blogid = req.params.blogid
        const { title, slug, cover, tags, body, savedAt, saveOrPublish } = req.body
        let query = ''
        let values = []
        let message = ''

        if (!(blogid && title && slug && cover && tags && body && savedAt && saveOrPublish)) {
            return res.status(400).send({ info: 'Data Required!' })
        }

        if (saveOrPublish === 'save') {
            query = `UPDATE blog SET title=$1,slug=$2,cover=$3,tags=$4,body=$5 
            WHERE blogid=$6 RETURNING blogid`
            values = [title, slug, cover, tags, body, blogid]
            message = 'Your blog has been saved!'
        } else {
            query = `UPDATE blog SET title=$1,slug=$2,cover=$3,tags=$4,body=$5,publishedat=$6,ispublished=$7
            WHERE blogid=$8 RETURNING blogid`
            values = [title, slug, cover, tags, body, savedAt, 1, blogid]
            message = 'Your blog has been published!'
        }

        try {
            const { rows } = await dbQuery(query, values)
            const dbResponse = rows[0]
            if (dbResponse.blogid) {
                return res.status(200).json({ info: message })
            } else {
                return res.status(400).send({ info: 'Blog not found!' })
            }
        } catch (err) {
            if (err.routine === '_bt_check_unique') {
                return res.status(400).send({ info: 'Blog title already in use!' })
            }
            return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
        }

    }
)

router.put('/author/blog/unpublish/:blogid',
    verifyToken,
    async (req, res) => {

        const blogid = req.params.blogid
        const query = 'UPDATE blog SET ispublished=$1 WHERE blogid=$2 RETURNING blogid'
        const values = [0, blogid]

        if (!blogid) {
            return res.status(400).send({ info: 'Data Required!' })
        }

        try {
            const { rows } = await dbQuery(query, values)
            const dbResponse = rows[0]
            if (dbResponse.blogid) {
                return res.status(200).json({ info: 'Your blog has been unpublished!' })
            } else {
                return res.status(400).send({ info: 'Blog not found!' })
            }
        } catch (err) {
            if (err) {
                return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
            }
        }

    }
)

router.delete('/author/blog/delete/:blogid',
    verifyToken,
    async (req, res) => {

        const blogid = req.params.blogid
        const query = 'DELETE FROM blog WHERE blogid=$1 RETURNING blogid'
        const values = [blogid]

        if (!blogid) {
            return res.status(400).send({ info: 'Data Required!' })
        }

        try {
            const { rows } = await dbQuery(query, values)
            const dbResponse = rows[0]
            if (dbResponse.blogid) {
                return res.status(200).json({ info: 'Your blog has been deleted!' })
            } else {
                return res.status(400).send({ info: 'Blog not found!' })
            }
        } catch (err) {
            if (err) {
                return res.status(500).send({ info: 'SOMETHING WENT WRONG' })
            }
        }

    }
)


module.exports = router