const express = require('express')
const helmet = require('helmet')

const app = express()

app.use(helmet())
app.use(express.json({ extended: false }))

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))

module.exports = app
