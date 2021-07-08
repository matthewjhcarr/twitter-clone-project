const express = require('express')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')

// @route   GET api/profile/me
// @desc    Retrieve logged in user's profile
// @access  Private
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
    console.err(err.message)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private
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
      console.error(err.message)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
    }
  }
)

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    return res.json(profiles)
  } catch (err) {
    console.error(err.message)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar'])

    if (!profile) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Profile not found.' })
    }
    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Profile not found.' })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

module.exports = router
