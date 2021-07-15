const mongoose = require('mongoose')
const { mongoURI } = require('../config')

const ERROR_CODE = 1

/**
 * Connects to the database specified in mongoURI
 */
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true
    })
  } catch (err) {
    // Exit process with failure
    process.exit(ERROR_CODE)
  }
}

module.exports = connectDB
