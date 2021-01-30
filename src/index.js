const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 8000
const cors = require('cors')

const authorRouter = require('./routes/author')
const blogRouter = require('./routes/blog')

app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (req, res) => {
  res.send({ info: 'Hello' })
})

app.use(authorRouter)
app.use(blogRouter)

app.listen(port, () => {
    console.log('RUNNING ON PORT '+port)
})