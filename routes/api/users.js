const express = require('express')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const { jwtSecret, jwtExpiration } = require('../../config')

const router = express.Router()

// @route   POST api/users
// @desc    Register user
// @access  public
router.post(
  '/',
  [
    check('name', 'Name is required!').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {
      // See if user exists
      let user = await User.findOne({ email })

      if (user) {
        return res.status(400).json({
          errors: [[{ msg: 'User already exists' }]]
        })
      }

      // Get users gravatar
      const avatar = gravatar.url(email, {
        // Default size
        s: '200',
        // Rating (sfw)
        r: 'pg',
        // Default image (if none exists)
        d: 'mm'
      })

      user = new User({
        name,
        email,
        avatar,
        password
      })

      // Encrypt password
      // 10 rounds is recommended amount in documentation
      const salt = await bcrypt.genSalt(10)

      user.password = await bcrypt.hash(password, salt)

      await user.save()

      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        jwtSecret,
        { expiresIn: jwtExpiration },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

// @route   DELETE api/users
// @desc    Delete user and profile
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // TODO: Remove profile

    // Remove user
    await User.findOneAndRemove({ _id: req.user.id })

    res.json({ msg: 'User deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
