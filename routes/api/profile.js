const express = require('express')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Retrieves the logged in user's profile
 *     description: Returns a profile for a user. Can be used to TODO.
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
 *                   description: The profile ID
 *                   example: 60e4c862bc71fd0843361251
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The user ID
 *                       example: 60e4c843bc71fd0843361250
 *                     avatar:
 *                       type: string
 *                       description: A link to the user's gravatar
 *                       example: //www.gravatar.com/avatar/a18bf786efb76a3d56ee69a3b343952a?s=200&r=pg&d=mm
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                   example: John Doe
 *                 bio:
 *                   type: string
 *                   description: The user's bio
 *                   example: Just a guy out and about
 *                 location:
 *                   type: string
 *                   description: The user's location
 *                   example: Nowhere
 *                 date:
 *                   type: string
 *                   description: The date the user's profile was created
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
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    )

    if (!profile) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'There is no profile for this user' })
    }

    return res.json(profile)
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update a user profile
 *     description: Returns a user's profile. Allows users to create or update their profiles.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         description: Authentication token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *                 example: John Doe
 *               bio:
 *                 type: string
 *                 description: The user's bio
 *                 example: Just a guy out and about
 *               location:
 *                 type: string
 *                 description: The user's location
 *                 example: Nowhere
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
 *                   description: The profile ID
 *                   example: 60e4c862bc71fd0843361251
 *                 user:
 *                   type: string
 *                   description: The user ID
 *                   example: 60e4c843bc71fd0843361250
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                   example: John Doe
 *                 bio:
 *                   type: string
 *                   description: The user's bio
 *                   example: Just a guy out and about
 *                 location:
 *                   type: string
 *                   description: The user's location
 *                   example: Nowhere
 *                 date:
 *                   type: string
 *                   description: The date the user's profile was created
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
router.post(
  '/',
  [auth, [check('name', 'Name is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() })
    }

    const {
      name,
      bio,
      location,
      website,
      youtube,
      facebook,
      instagram,
      linkedin
    } = req.body

    // Build profile object
    const profileFields = {
      user: req.user.id,
      name,
      bio,
      location,
      website
    }

    // Build social object and add to profileFields
    const socialfields = { youtube, instagram, linkedin, facebook }

    profileFields.social = socialfields

    try {
      let profile = await Profile.findOne({ user: req.user.id })

      if (profile) {
        // Update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )

        return res.json(profile)
      }

      // Create profile
      profile = new Profile(profileFields)

      await profile.save()

      return res.json(profile)
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
    }
  }
)

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Retrieves all profiles
 *     description: Retrieves all profiles in the database. Can be used to list profiles in a "who to follow" page.
 *     responses:
 *       200:
 *         description: OK response. Returns the logged in user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The profile ID
 *                     example: 60e4c862bc71fd0843361251
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The user ID
 *                         example: 60e4c843bc71fd0843361250
 *                       avatar:
 *                         type: string
 *                         description: A link to the user's gravatar
 *                         example: //www.gravatar.com/avatar/a18bf786efb76a3d56ee69a3b343952a?s=200&r=pg&d=mm
 *                   name:
 *                     type: string
 *                     description: The user's name
 *                     example: John Doe
 *                   bio:
 *                     type: string
 *                     description: The user's bio
 *                     example: Just a guy out and about
 *                   location:
 *                     type: string
 *                     description: The user's location
 *                     example: Nowhere
 *                   date:
 *                     type: string
 *                     description: The date the user's profile was created
 *                     example: 2021-07-06T21:16:51.667Z
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    return res.json(profiles)
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

/**
 * @swagger
 * /api/profile/user/{userid}:
 *   post:
 *     summary: Returns a single user's profile
 *     description: Returns a single user's profile. Allows users to view profiles.
 *     parameters:
 *       - in: userid
 *         name: User ID
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID of the profile you wish to request
 *         example: 60e4c843bc71fd0843361250
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
 *                   description: The profile ID
 *                   example: 60e4c862bc71fd0843361251
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The user ID
 *                       example: 60e4c843bc71fd0843361250
 *                     avatar:
 *                       type: string
 *                       description: A link to the user's gravatar
 *                       example: //www.gravatar.com/avatar/a18bf786efb76a3d56ee69a3b343952a?s=200&r=pg&d=mm
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                   example: John Doe
 *                 bio:
 *                   type: string
 *                   description: The user's bio
 *                   example: Just a guy out and about
 *                 location:
 *                   type: string
 *                   description: The user's location
 *                   example: Nowhere
 *                 date:
 *                   type: string
 *                   description: The date the user's profile was created
 *                   example: 2021-07-06T21:16:51.667Z
 *       401:
 *         description: Unauthorized response. Profile must exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the error
 *                   example: Profile not found
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['username', 'avatar', 'date'])

    if (!profile) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Profile not found.' })
    }
    return res.json(profile)
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Profile not found.' })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

module.exports = router
