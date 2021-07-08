const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { jwtSecret } = require('../config')

module.exports = function (req, res, next) {
  // Get token from the header
  const token = req.header('x-auth-token')

  // Check if no token
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'No token, authorization denied'
    })
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, jwtSecret)

    req.user = decoded.user
    next()
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'Token is not valid'
    })
  }
}
