const app = require('./server')
const connectDB = require('./config/db')

// Connect database
connectDB()

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
)
