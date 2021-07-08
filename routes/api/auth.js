const express = require('express')
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')
const { jwtSecret, jwtExpiration } = require('../../config')

const router = express.Router()

// @route GET /api/auth
// @desc Get user currently logged in
// @access Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    return res.json(user)
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      // See if user exists
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: [[{ msg: 'Invalid credentials' }]]
        })
      }

      // Ensure password matches
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: [[{ msg: 'Invalid credentials' }]]
        })
      }

      // Create jwt payload
      const payload = {
        user: {
          id: user.id
        }
      }

      // Sign jwt
      jwt.sign(
        payload,
        jwtSecret,
        // TODO: change this value back to 3600 for production
        { expiresIn: jwtExpiration },
        (err, token) => {
          if (err) throw err
          // Return jwt
          return res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server error')
    }
  }
)

module.exports = router
