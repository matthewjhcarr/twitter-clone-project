const express = require('express')
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')
const { jwtSecret, jwtExpiration } = require('../../config')

const router = express.Router()

/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Get the user currently logged in
 *     description: Retrieves the currently logged in user. Can be used to TODO
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
 *                 _id:
 *                   type: string
 *                   description: The user ID
 *                   example: 60e4c843bc71fd0843361250
 *                 email:
 *                   type: string
 *                   description: The user's email address
 *                   example: johndoe@gmail.com
 *                 avatar:
 *                   type: string
 *                   description: The gravatar associated with the user's email
 *                   example: //www.gravatar.com/avatar/a18bf786efb76a3d56ee69a3b343952a?s=200&r=pg&d=mm
 *                 date:
 *                   type: string
 *                   description: The date the user's account was created
 *                   example: 2021-07-06T21:16:51.667Z
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the response
 *                   example: No token, authorization denied
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    return res.json(user)
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Authenticate user & get token
 *     description: Returns a token for a user. Can be used to authenticate users/log them in.
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
 *                 example: johndoe@gmail.com
 *     responses:
 *       200:
 *         description: OK response. Returns the token for a user.
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
          errors: [{ msg: 'Invalid credentials' }]
        })
      }

      // Ensure password matches
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: [{ msg: 'Invalid credentials' }]
        })
      }

      // Create jwt payload
      const payload = {
        user: {
          id: user.id
        }
      }

      // Sign jwt
      return jwt.sign(
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
      
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server error')
    }
  }
)

module.exports = router
