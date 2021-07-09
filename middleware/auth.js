const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { jwtSecret } = require('../config')

/**
 * Authorization middleware
 * @param {*} req Request object
 * @param {*} res Response object
 * @param {*} next Middleware function that calls the next middleware in the stack
 * @returns Returns either the response object with an error message or the next function
 */
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
    return next()
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'Token is not valid'
    })
  }
}
