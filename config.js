const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  mongoURI: process.env.MONGO_URI,
  testUsers: process.env.TEST_USERS,
  testAuth: process.env.TEST_AUTH,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION
}
