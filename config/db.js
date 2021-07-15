const mongoose = require('mongoose')
const { mongoURI, ERROR_CODE } = require('../config')

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
