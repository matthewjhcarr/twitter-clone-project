const mongoose = require('mongoose')
const { mongoURI } = require('../config')

const ERROR_CODE = 1

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true
    })

    console.log('MongoDB Connected...')
  } catch (err) {
    console.error(err.message)
    // Exit process with failure
    process.exit(ERROR_CODE)
  }
}

module.exports = connectDB
