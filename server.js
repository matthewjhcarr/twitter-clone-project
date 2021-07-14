const express = require('express')
const helmet = require('helmet')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const { DEV_PORT } = require('./config')

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Twitter clone API',
    version: '1.0.0',
    description: 'A twitter clone project written in the MERN stack',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://spdx.org/licenses/MIT.html'
    },
    contact: {
      name: 'Twitter clone',
      url: 'TBD'
    }
  },
  servers: [
    {
      url: `http://localhost:${DEV_PORT}`,
      description: 'Development server'
    }
  ]
}

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/api/*.js']
}

const swaggerSpec = swaggerJSDoc(options)

const app = express()

app.use(helmet())
app.use(express.json({ extended: false }))

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/tweets', require('./routes/api/tweets'))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

module.exports = app
