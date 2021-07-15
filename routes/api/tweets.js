const express = require('express')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

/**
 * @swagger
 *   components:
 *     schemas:
 *       Tweet:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *             description: The tweet ID
 *             example: 60e4c862bc71fd0843361251
 *           user:
 *             type: string
 *             description: The user ID
 *             example: 60e4c843bc71fd0843361250
 *           avatar:
 *             type: string
 *             description: A link to the user's gravatar
 *             example: //www.gravatar.com/avatar/a18bf786efb76a3d56ee69a3b343952a?s=200&r=pg&d=mm
 *           text:
 *             type: string
 *             description: The body of the tweet
 *             example: Hello, world!
 *           repliedTo:
 *             type: string
 *             description: The ID of the tweet this tweet is in reply to
 *             example: 60ef60cbd032b21318fe72e4
 *           likes:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of this like (can be ignored)
 *                   example: 60ef643efd3e251356cd3472
 *                 reply:
 *                   type: string
 *                   description: The ID of the user who liked this tweet
 *                   example: 60ef2853601eb20b9648c411
 *           replies:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of this reply object (can be ignored)
 *                   example: 60ef63f7fd3e251356cd3471
 *                 reply:
 *                   type: string
 *                   description: The ID of the tweet this reply links to
 *                   example: 60ef63f6fd3e251356cd3470
 *           datePosted:
 *             type: string
 *             description: The date the user's profile was created
 *             example: 2021-07-06T21:16:51.667Z
 *           dateUpdated:
 *             type: string
 *             description: The date the user's profile was created
 *             example: 2021-07-06T21:20:39.667Z
 *       MinError:
 *         type: object
 *         properties:
 *           msg:
 *             type: string
 *             description: A message describing the problem with the request
 *             example: Text is required
 *       Error:
 *         allOf:
 *           - $ref: '#components/schemas/MinError'
 *           - type: object
 *             properties:
 *               param:
 *                 type: string
 *                 description: The name of the parameter in the request with the problem
 *                 example: text
 *               location:
 *                 type: string
 *                 description: A message describing the location of the issue with the request
 *                 example: body
 */
const Tweet = require('../../models/Tweet')
const User = require('../../models/User')
const Profile = require('../../models/Profile')

/**
 * @swagger
 * /api/tweets:
 *   post:
 *     summary: Create a new tweet
 *     description: Creates a new tweet. Allows users to post tweets.
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
 *               text:
 *                 type: string
 *                 description: The body of the tweet
 *                 example: Hello, world!
 *     responses:
 *       200:
 *         description: OK response. Returns the new tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/Tweet'
 *       400:
 *         description: Bad request. Request must contain a text field.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#components/schemas/Error'
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/MinError'
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() })
    }

    try {
      const user = await User.findById(req.user.id).select('-password')
      const { name } = await Profile.findOne({ user: req.user.id })

      const newTweet = new Tweet({
        user: req.user.id,
        name,
        avatar: user.avatar,
        text: req.body.text
      })

      const tweet = await newTweet.save()

      return res.json(tweet)
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
    }
  }
)

/**
 * @swagger
 * /api/tweets/reply/{tweet_id}:
 *   post:
 *     summary: Reply to a tweet
 *     description: Replies to an existing tweet. Allows users to post tweets.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         description: Authentication token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *       - in: tweet_id
 *         name: Tweet ID
 *         schema:
 *           type: string
 *           description: The ID of the tweet to reply to
 *           example: 60e4c862bc71fd0843361251
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The body of the tweet
 *                 example: Hello, world!
 *     responses:
 *       200:
 *         description: OK response. Returns the new tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/Tweet'
 *       400:
 *         description: Bad request. Request must contain a text field.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#components/schemas/Error'
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/MinError'
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.post(
  '/reply/:tweet_id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() })
    }

    try {
      // Retrieves tweet
      const replyTo = await Tweet.findById(req.params.tweet_id)

      if (!replyTo) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: 'Tweet not found' })
      }

      const user = await User.findById(req.user.id).select('-password')
      const { name } = await Profile.findOne({ user: req.user.id })

      const newTweet = new Tweet({
        user: req.user.id,
        name,
        avatar: user.avatar,
        text: req.body.text,
        repliedTo: replyTo.id
      })

      const tweet = await newTweet.save()

      replyTo.replies.push({ reply: tweet.id })

      await replyTo.save()

      return res.json(tweet)
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
    }
  }
)

/**
 * @swagger
 * /api/tweets:
 *   get:
 *     summary: Retrieves all tweets
 *     description: Retrieves all tweets. Used to list tweets on the homepage.
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
 *         description: OK response. Returns an array of all tweets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#components/schemas/Tweet'
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/MinError'
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.get('/', auth, async (req, res) => {
  try {
    // Retrieves tweets in order from newest first
    const tweets = await Tweet.find().sort({ date: -1 })

    return res.json(tweets)
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

/**
 * @swagger
 * /api/tweets/{tweet_id}:
 *   get:
 *     summary: Retrieves tweet by ID
 *     description: Retrieves a specifc tweet. Used to view specific tweets.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         description: Authentication token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *       - in: tweet_id
 *         name: Tweet ID
 *         schema:
 *           type: string
 *           description: The ID of the tweet to return
 *           example: 60e4c862bc71fd0843361251
 *         required: true
 *     responses:
 *       200:
 *         description: OK response. Returns the requested tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/Tweet'
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/MinError'
 *       404:
 *         description: Not found. Tweet does not exist.
 *         content:
 *           application/json:
 *           schema:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *                 description: A message to describe the error
 *                 example: Tweet not found
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.get('/:tweet_id', auth, async (req, res) => {
  try {
    // Retrieves tweet
    const tweet = await Tweet.findById(req.params.tweet_id)

    if (!tweet) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Tweet not found' })
    }

    return res.json(tweet)
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Tweet not found' })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

/**
 * @swagger
 * /api/tweets/{tweet_id}:
 *   delete:
 *     summary: Deletes a tweet
 *     description: Deletes a tweet. Allows users to delete their own tweets.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         description: Authentication token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *       - in: tweet_id
 *         name: Tweet ID
 *         schema:
 *           type: string
 *           description: The ID of the tweet to delete
 *           example: 60e4c862bc71fd0843361251
 *         required: true
 *     responses:
 *       200:
 *         description: OK response. Returns a message to confirm the tweet has been deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the successful response
 *                   example: Tweet removed
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/MinError'
 *       404:
 *         description: Not found. Could not find a tweet with that ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the unsuccessful response
 *                   example: Tweet not found
 *       403:
 *         description: Forbidden. You do not have the permission to delete this tweet.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the unsuccessful response
 *                   example: You are not authorised to delete this tweet
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.delete('/:tweet_id', auth, async (req, res) => {
  try {
    // Retrieves tweet
    const tweet = await Tweet.findById(req.params.tweet_id)

    if (!tweet) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Tweet not found' })
    }

    // Check user
    if (tweet.user.toString() !== req.user.id) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: 'You are not authorised to delete this tweet' })
    }

    await tweet.remove()

    return res.json({ msg: 'Tweet removed' })
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Tweet not found' })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

/**
 * @swagger
 * /api/tweets/{tweet_id}:
 *   put:
 *     summary: Edit a tweet
 *     description: Edit an existing tweet. Allows users to edit their own tweets.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         description: Authentication token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *       - in: tweet_id
 *         name: Tweet ID
 *         schema:
 *           type: string
 *           description: The ID of the tweet to edit
 *           example: 60e4c862bc71fd0843361251
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The body of the tweet
 *                 example: Hello, world!
 *     responses:
 *       200:
 *         description: OK response. Returns the edited tweet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/Tweet'
 *       400:
 *         description: Bad request. Request must contain a text field.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#components/schemas/Error'
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/MinError'
 *       404:
 *         description: Not found. Could not find a tweet with that ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the unsuccessful response
 *                   example: Tweet not found
 *       403:
 *         description: Forbidden. You do not have the permission to edit this tweet.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the unsuccessful response
 *                   example: You are not authorised to edit this tweet
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.put(
  '/:tweet_id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() })
    }

    try {
      // Retrieves tweet
      let tweet = await Tweet.findById(req.params.tweet_id)

      if (!tweet) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: 'Tweet not found' })
      }

      // Check user
      if (tweet.user.toString() !== req.user.id) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ msg: 'You are not authorised to edit this tweet' })
      }

      tweet = await Tweet.findByIdAndUpdate(
        req.params.tweet_id,
        { $set: req.body, dateUpdated: Date.now() },
        { new: true }
      )

      return res.json(tweet)
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ msg: 'Tweet not found' })
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
    }
  }
)

/**
 * @swagger
 * /api/tweets/like/{tweet_id}:
 *   put:
 *     summary: Like a tweet
 *     description: Likes an existing tweet. Allows users to like tweets once.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         description: Authentication token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *       - in: tweet_id
 *         name: Tweet ID
 *         schema:
 *           type: string
 *           description: The ID of the tweet to like
 *           example: 60e4c862bc71fd0843361251
 *         required: true
 *     responses:
 *       200:
 *         description: OK response. Returns the array of likes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of this like (can be ignored)
 *                     example: 60ef643efd3e251356cd3472
 *                   user:
 *                     type: string
 *                     description: The ID of the user who liked this tweet
 *                     example: 60ef2853601eb20b9648c411
 *       400:
 *         description: Bad request. Tweet has already been liked.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#components/schemas/Error'
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/MinError'
 *       404:
 *         description: Not found. Could not find a tweet with that ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the unsuccessful response
 *                   example: Tweet not found
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.put('/like/:tweet_id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweet_id)

    if (!tweet) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Tweet not found' })
    }

    // Check if tweet has already been liked
    if (
      tweet.likes.filter((like) => like.user.toString() === req.user.id)
        .length > 0
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Tweet has already been liked' })
    }

    tweet.likes.unshift({ user: req.user.id })

    await tweet.save()

    return res.json(tweet.likes)
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Tweet not found' })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

/**
 * @swagger
 * /api/tweets/unlike/{tweet_id}:
 *   put:
 *     summary: Unlike a tweet
 *     description: Removes like from an existing tweet. Allows users to remove like from tweets once.
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         description: Authentication token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *       - in: tweet_id
 *         name: Tweet ID
 *         schema:
 *           type: string
 *           description: The ID of the tweet to unlike
 *           example: 60e4c862bc71fd0843361251
 *         required: true
 *     responses:
 *       200:
 *         description: OK response. Returns the array of likes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of this like (can be ignored)
 *                     example: 60ef643efd3e251356cd3472
 *                   user:
 *                     type: string
 *                     description: The ID of the user who liked this tweet
 *                     example: 60ef2853601eb20b9648c411
 *       400:
 *         description: Bad request. Tweet has not yet been liked.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#components/schemas/Error'
 *       401:
 *         description: Unauthorized response. User must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/MinError'
 *       404:
 *         description: Not found. Could not find a tweet with that ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: A message to describe the unsuccessful response
 *                   example: Tweet not found
 *       500:
 *         description: Internal Server Error response. An error has occured on the server.
 */
router.put('/unlike/:tweet_id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweet_id)

    if (!tweet) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Tweet not found' })
    }

    // Check if tweet has already been liked
    if (
      tweet.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Tweet has not yet been liked' })
    }

    // Get remove index
    const removeIndex = tweet.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id)

    tweet.likes.splice(removeIndex, 1)

    await tweet.save()

    return res.json(tweet.likes)
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Tweet not found' })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server Error')
  }
})

module.exports = router
