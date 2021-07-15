const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  mongoURI: process.env.MONGO_URI,
  testUsers: process.env.TEST_USERS,
  testAuth: process.env.TEST_AUTH,
  testProfile: process.env.TEST_PROFILE,
  testTweets: process.env.TEST_TWEETS,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  DEV_PORT: 5000,
  ERROR_CODE: 1
}
