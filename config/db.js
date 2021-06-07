const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const ERROR_CODE = 1

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })

    console.log('MongoDB Connected...')
  } catch (err) {
    console.error(err.message)
    // Exit process with failure
    process.exit(ERROR_CODE)
  }
}

module.exports = connectDB
