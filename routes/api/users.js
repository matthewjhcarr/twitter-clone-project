import express from 'express'
import gravatar from 'gravatar'
import bcrypt from 'bcryptjs'
import { check, validationResult } from 'express-validator'
import User from '../../models/User'

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

      // Return jsonwebtoken
      res.send('User registered')
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

module.exports = router