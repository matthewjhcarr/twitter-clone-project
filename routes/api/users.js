const express = require('express')
const { StatusCodes } = require('http-status-codes')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Profile = require('../../models/Profile')
const { jwtSecret, jwtExpiration } = require('../../config')

const router = express.Router()

const MIN_PASSWORD_LENGTH = 6
const ENCRYPTION_ROUNDS = 10

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a user
 *     description: Returns the new user's token. Can be used to register new users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: password123
 *     responses:
 *       200:
 *         description: OK response. Returns the logged in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The jwt authentication token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjBlNGM4NDNiYzcxZmQwODQzMzYxMjUwIn0sImlhdCI6MTYyNTc3NTEyMCwiZXhwIjoxNjI1Nzc1NDgwfQ.5iJJLusOhXv9Ukjw1-zrvG2E5yORqrahwih0qKuMmEA
 *       400:
 *         description: Bad request. The response body must contain the required fields email and password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: A message describing the problem with the request
 *                         example: Password is required
 *                       param:
 *                         type: string
 *                         description: The name of the parameter in the request with the problem
 *                         example: password
 *                       location:
 *                         type: string
 *                         description: A message describing the location of the issue with the request
 *                         example: body
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: MIN_PASSWORD_LENGTH })
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
      let user = await User.findOne({ email })

      if (user) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: [{ msg: 'User already exists' }]
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
        email,
        avatar,
        password
      })

      // Encrypt password
      // 10 rounds is recommended amount in documentation
      const salt = await bcrypt.genSalt(ENCRYPTION_ROUNDS)

      user.password = await bcrypt.hash(password, salt)

      await user.save()

      const payload = {
        user: {
          id: user.id
        }
      }

      return jwt.sign(
        payload,
        jwtSecret,
        { expiresIn: jwtExpiration },
        (err, token) => {
          if (err) throw err
          return res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server error')
    }
  }
)

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: Deletes a user and their profile
 *     description: Deletes a user from the database along with their profile.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         description: Authentication token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *     responses:
 *       200:
 *         description: OK response. Returns the logged in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to confirm the action was successful
 *                   example: User deleted
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.delete('/', auth, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id })

    // Remove user
    await User.findOneAndRemove({ _id: req.user.id })

    return res.json({ msg: 'User deleted' })
  } catch (err) {
    console.error(err.message)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

module.exports = router
