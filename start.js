const app = require('./server')
const connectDB = require('./config/db')
const { DEV_PORT } = require('./config')

// Connect database
connectDB()

const PORT = process.env.PORT || DEV_PORT

app.listen(PORT, () => )
