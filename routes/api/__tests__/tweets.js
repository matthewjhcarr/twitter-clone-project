const mongoose = require('mongoose')
const request = require('supertest')
const { StatusCodes } = require('http-status-codes')
const server = require('../../../server')
const User = require('../../../models/User')
const Profile = require('../../../models/Profile')
const Tweet = require('../../../models/Tweet')
const { testTweets } = require('../../../config')

const TEST_NAME = 'gooby goober'
const TEST_BIO = 'its a bio init'
const TEST_LOCATION = 'the test zone'
const TEXT_REQUIRED = 'Text is required'
const TEXT = 'text'
const BODY = 'body'
const NO_TOKEN = 'No token, authorization denied'
const TWEET_NOT_FOUND = 'Tweet not found'
const FIRST_TWEET = 'Howdy!'
const REPLY_TWEET = 'yall good?'
const EDITED_TWEET = 'made an oopsie'

/**
 * Test user token
 */
let token = ''
let secondToken = ''

/**
 * Executed before all tests. Connects to the profile test database and creates a test user.
 */
beforeAll(async () => {
  try {
    await mongoose.connect(testTweets, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })

    // Create test user
    const {
      body: { token: resToken }
    } = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send({
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })

    token = resToken

    // Create test user profile
    await request(server)
      .post('/api/profile')
      .set('Content-Type', 'application/json')
      .set('x-auth-token', token)
      .send({
        name: TEST_NAME,
        bio: TEST_BIO,
        location: TEST_LOCATION
      })

    // Create second user
    const {
      body: { token: secondResToken }
    } = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send({
        email: 'secondguy@gmail.com',
        password: 'testpass123'
      })

    secondToken = secondResToken

    // Create second profile
    await request(server)
      .post('/api/profile')
      .set('Content-Type', 'application/json')
      .set('x-auth-token', secondToken)
      .send({
        name: 'Other Guy',
        bio: "I'm here too!",
        location: 'Just floating around'
      })
  } catch (err) {

  }
})

/**
 * Executed after all tests. Closes the connection to auth test database and deletes any users in the database.
 */
afterAll(async () => {
  await User.deleteMany()
  await Profile.deleteMany()
  await mongoose.connection.close()
})

/**
 * Executed after each test. Deletes all profiles from the database.
 */
afterEach(async () => {
  await Tweet.deleteMany()
})

/**
 * Tests the tweet endpoints
 */
describe('Tweet testing', () => {
  /**
   * Tests tweet creation on POST /api/tweets endpoint
   */
  describe('POST /api/tweets (Create tweet)', () => {
    /**
     * Tests POST /api/tweets 200 response
     */
    it('Should create a tweet', async () => {
      expect.assertions(3) // skipcq: JS-0074

      const {
        statusCode,
        body: { name, text }
      } = await request(server)
        .post('/api/tweets')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          text: FIRST_TWEET
        })

      expect(statusCode).toEqual(StatusCodes.OK)
      expect(name).toEqual(TEST_NAME)
      expect(text).toEqual(FIRST_TWEET)
    })

    /**
     * Tests POST /api/tweets 400 response
     */
    it('Should not create a tweet with no text', async () => {
      expect.assertions(4) // skipcq: JS-0074

      const {
        statusCode,
        body: {
          errors: [{ msg, param, location }]
        }
      } = await request(server)
        .post('/api/tweets')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          text: ''
        })

      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(msg).toEqual(TEXT_REQUIRED)
      expect(param).toEqual(TEXT)
      expect(location).toEqual(BODY)
    })

    /**
     * Tests POST /api/tweets 401 response
     */
    it('Should not create a tweet when user is not logged in', async () => {
      expect.assertions(2) // skipcq: JS-0074

      const {
        statusCode,
        body: { msg }
      } = await request(server)
        .post('/api/tweets')
        .set('Content-Type', 'application/json')
        .send({
          text: FIRST_TWEET
        })

      expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(msg).toEqual(NO_TOKEN)
    })
  })

  describe('Operations on existing tweets', () => {
    let tweetId = ''

    beforeEach(async () => {
      const {
        body: { _id: id }
      } = await request(server)
        .post('/api/tweets')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          text: FIRST_TWEET
        })

      tweetId = id
    })

    /**
     * Tests creation of a reply tweet on POST /api/tweets/reply/:tweet_id endpoint
     */
    describe('POST /api/tweets/reply/:tweet_id (Reply to tweet)', () => {
      /**
       * Tests POST /api/tweets/reply/:tweet_id 200 response
       */
      it('Should create a reply', async () => {
        expect.assertions(5) // skipcq: JS-0074

        const {
          statusCode,
          body: { _id: replyId, name, text, repliedTo }
        } = await request(server)
          .post(`/api/tweets/reply/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', token)
          .send({
            text: REPLY_TWEET
          })

        expect(statusCode).toEqual(StatusCodes.OK)
        expect(name).toEqual(TEST_NAME)
        expect(text).toEqual(REPLY_TWEET)
        expect(repliedTo).toEqual(tweetId)

        const {
          body: {
            replies: [{ reply }]
          }
        } = await request(server)
          .get(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        expect(reply).toEqual(replyId)
      })

      /**
       * Tests POST /api/tweets/reply/:tweet_id 400 response
       */
      it('Should not create a reply with no text', async () => {
        expect.assertions(5) // skipcq: JS-0074

        const {
          statusCode,
          body: {
            errors: [{ msg, param, location }]
          }
        } = await request(server)
          .post(`/api/tweets/reply/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', token)
          .send({
            text: ''
          })

        expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(msg).toEqual(TEXT_REQUIRED)
        expect(param).toEqual(TEXT)
        expect(location).toEqual(BODY)

        const {
          body: { replies }
        } = await request(server)
          .get(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        expect(replies).toEqual([])
      })

      /**
       * Tests POST /api/tweets/reply/:tweet_id 401 response
       */
      it('Should not create a reply with no token', async () => {
        expect.assertions(3) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .post(`/api/tweets/reply/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', '')
          .send({
            text: REPLY_TWEET
          })

        expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(msg).toEqual(NO_TOKEN)

        const {
          body: { replies }
        } = await request(server)
          .get(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        expect(replies).toEqual([])
      })
    })

    /**
     * Tests retrieval of all tweets on GET /api/tweets endpoint
     */
    describe('GET /api/tweets (Get all tweets)', () => {
      const secondTweet = 'what up'

      beforeEach(async () => {
        await request(server)
          .post('/api/tweets')
          .set('Content-Type', 'application/json')
          .set('x-auth-token', token)
          .send({
            text: secondTweet
          })
      })

      /**
       * Tests GET /api/tweets 200 response
       */
      it('Should get all tweets', async () => {
        expect.assertions(5) // skipcq: JS-0074

        const {
          statusCode,
          body: [{ name: name1, text: text1 }, { name: name2, text: text2 }]
        } = await request(server).get('/api/tweets').set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.OK)
        expect(name1).toEqual(TEST_NAME)
        expect(text1).toEqual(FIRST_TWEET)
        expect(name2).toEqual(TEST_NAME)
        expect(text2).toEqual(secondTweet)
      })

      /**
       * Tests GET /api/tweets 401 response
       */
      it('Should get all tweets', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server).get('/api/tweets').set('x-auth-token', '')

        expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(msg).toEqual(NO_TOKEN)
      })
    })

    /**
     * Tests retrieval of specific tweet on GET /api/tweets/:tweet_id endpoint
     */
    describe('GET /api/tweets/:tweet_id, (Get specific tweet)', () => {
      /**
       * Tests GET /api/tweets/:tweet_id 200 response
       */
      it('Should get specified tweet', async () => {
        expect.assertions(3) // skipcq: JS-0074

        const {
          statusCode,
          body: { name, text }
        } = await request(server)
          .get(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.OK)
        expect(name).toEqual(TEST_NAME)
        expect(text).toEqual(FIRST_TWEET)
      })

      /**
       * Tests GET /api/tweets/:tweet_id 401 response
       */
      it('Should not get specified tweet without token', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .get(`/api/tweets/${tweetId}`)
          .set('x-auth-token', '')

        expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(msg).toEqual(NO_TOKEN)
      })

      /**
       * Tests GET /api/tweets/:tweet_id 404 response
       */
      it('Should display error message for an invalid id', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .get('/api/tweets/invalidid')
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })

      /**
       * Tests GET /api/tweets/:tweet_id 404 response
       */
      it('Should display error message for a tweet that does not exist', async () => {
        expect.assertions(2) // skipcq: JS-0074

        await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .get(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })
    })

    /**
     * Tests deletion of specific tweet on DELETE /api/tweets/:tweet_id endpoint
     */
    describe('DELETE /api/tweets/:tweet_id (Delete a tweet)', () => {
      /**
       * Tests DELETE /api/tweets/:tweet_id 200 response
       */
      it('Should delete a tweet', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.OK)
        expect(msg).toEqual('Tweet removed')
      })

      /**
       * Tests DELETE /api/tweets/:tweet_id 401 response
       */
      it('Should not delete a tweet without a valid token', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', '')

        expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(msg).toEqual(NO_TOKEN)
      })

      /**
       * Tests DELETE /api/tweets/:tweet_id 404 response
       */
      it('Should not delete a tweet that does not exist', async () => {
        expect.assertions(2) // skipcq: JS-0074

        await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })

      /**
       * Tests DELETE /api/tweets/:tweet_id 404 response
       */
      it('Should not delete a tweet given an invalid id', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .delete('/api/tweets/invalidid')
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })

      /**
       * Tests DELETE /api/tweets/:tweet_id 403 response
       */
      it('Should not allow a user to delete another users tweet', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', secondToken)

        expect(statusCode).toEqual(StatusCodes.FORBIDDEN)
        expect(msg).toEqual('You are not authorised to delete this tweet')
      })
    })

    /**
     * Tests editing of specific tweet on PUT /api/tweets/:tweet_id endpoint
     */
    describe('PUT /api/tweets/:tweet_id (Edit a tweet', () => {
      /**
       * Tests PUT /api/tweets/:tweet_id 200 response
       */
      it('Should edit a tweet', async () => {
        expect.assertions(4) // skipcq: JS-0074

        const {
          statusCode,
          body: { name, text, datePosted, dateUpdated }
        } = await request(server)
          .put(`/api/tweets/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', token)
          .send({ text: EDITED_TWEET })

        expect(statusCode).toEqual(StatusCodes.OK)
        expect(name).toEqual(TEST_NAME)
        expect(text).toEqual(EDITED_TWEET)
        expect(datePosted).not.toEqual(dateUpdated)
      })

      /**
       * Tests PUT /api/tweets/:tweet_id 200 response
       */
      it('Should edit a tweet', async () => {
        expect.assertions(4) // skipcq: JS-0074

        const {
          statusCode,
          body: { name, text, datePosted, dateUpdated }
        } = await request(server)
          .put(`/api/tweets/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', token)
          .send({ text: EDITED_TWEET })

        expect(statusCode).toEqual(StatusCodes.OK)
        expect(name).toEqual(TEST_NAME)
        expect(text).toEqual(EDITED_TWEET)
        expect(datePosted).not.toEqual(dateUpdated)
      })

      /**
       * Tests PUT /api/tweets/:tweet_id 400 response
       */
      it('Should not edit a tweet without a text field', async () => {
        expect.assertions(4) // skipcq: JS-0074

        const {
          statusCode,
          body: {
            errors: [{ msg, param, location }]
          }
        } = await request(server)
          .put(`/api/tweets/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', token)
          .send({ text: '' })

        expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(msg).toEqual(TEXT_REQUIRED)
        expect(param).toEqual(TEXT)
        expect(location).toEqual(BODY)
      })

      /**
       * Tests PUT /api/tweets/:tweet_id 401 response
       */
      it('Should not edit a tweet without a valid token', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', '')
          .send({ text: EDITED_TWEET })

        expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(msg).toEqual(NO_TOKEN)
      })

      /**
       * Tests PUT /api/tweets/:tweet_id 404 response
       */
      it('Should not edit a tweet with an invalid ID', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put('/api/tweets/invalidid')
          .set('Content-Type', 'application/json')
          .set('x-auth-token', token)
          .send({ text: EDITED_TWEET })

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })

      /**
       * Tests PUT /api/tweets/:tweet_id 404 response
       */
      it('Should not edit a tweet that does not exist', async () => {
        expect.assertions(2) // skipcq: JS-0074

        await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', token)
          .send({ text: EDITED_TWEET })

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })

      /**
       * Tests PUT /api/tweets/:tweet_id 403 response
       */
      it('Should not allow a user to edit another users tweet', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/${tweetId}`)
          .set('Content-Type', 'application/json')
          .set('x-auth-token', secondToken)
          .send({ text: EDITED_TWEET })

        expect(statusCode).toEqual(StatusCodes.FORBIDDEN)
        expect(msg).toEqual('You are not authorised to edit this tweet')
      })
    })

    /**
     * Tests liking a specific tweet on PUT /api/tweets/like/:tweet_id endpoint
     */
    describe('PUT /api/tweets/like/:tweet_id endpoint', () => {
      /**
       * Tests PUT /api/tweets/like/:tweet_id 200 response
       */
      it('Should like an existing tweet', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const {
          statusCode,
          body: [{ user }]
        } = await request(server)
          .put(`/api/tweets/like/${tweetId}`)
          .set('x-auth-token', token)

        const {
          body: { _id: userId }
        } = await request(server).get('/api/auth').set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.OK)
        expect(user).toEqual(userId)
      })

      /**
       * Tests PUT /api/tweets/like/:tweet_id 400 response
       */
      it('Should not like an existing tweet that has already been liked', async () => {
        expect.assertions(2) // skipcq: JS-0074

        await request(server)
          .put(`/api/tweets/like/${tweetId}`)
          .set('x-auth-token', token)

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/like/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(msg).toEqual('Tweet has already been liked')
      })

      /**
       * Tests PUT /api/tweets/like/:tweet_id 401 response
       */
      it('Should not like an existing tweet without a valid token', async () => {
        expect.assertions(2) // skipcq: JS-0074
        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/like/${tweetId}`)
          .set('x-auth-token', '')

        expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(msg).toEqual(NO_TOKEN)
      })

      /**
       * Tests PUT /api/tweets/like/:tweet_id 404 response
       */
      it('Should not like a tweet with an invalid ID', async () => {
        expect.assertions(2) // skipcq: JS-0074
        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put('/api/tweets/like/invalidid')
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })

      /**
       * Tests PUT /api/tweets/like/:tweet_id 404 response
       */
      it('Should not like a tweet that does not exist', async () => {
        expect.assertions(2) // skipcq: JS-0074

        await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/like/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })
    })

    /**
     * Tests removing a like from a specific tweet on PUT /api/tweets/unlike/:tweet_id endpoint
     */
    describe('PUT /api/tweets/like/:tweet_id endpoint', () => {
      beforeEach(async () => {
        await request(server)
          .put(`/api/tweets/like/${tweetId}`)
          .set('x-auth-token', token)
      })

      /**
       * Tests PUT /api/tweets/unlike/:tweet_id 200 response
       */
      it('Should unlike an existing tweet', async () => {
        expect.assertions(2) // skipcq: JS-0074

        const { statusCode, body } = await request(server)
          .put(`/api/tweets/unlike/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.OK)
        expect(body).toEqual([])
      })

      /**
       * Tests PUT /api/tweets/unlike/:tweet_id 400 response
       */
      it('Should not unlike an existing tweet that has not yet been liked', async () => {
        expect.assertions(2) // skipcq: JS-0074

        await request(server)
          .put(`/api/tweets/unlike/${tweetId}`)
          .set('x-auth-token', token)

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/unlike/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
        expect(msg).toEqual('Tweet has not yet been liked')
      })

      /**
       * Tests PUT /api/tweets/unlike/:tweet_id 401 response
       */
      it('Should not unlike an existing tweet without a valid token', async () => {
        expect.assertions(2) // skipcq: JS-0074
        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/unlike/${tweetId}`)
          .set('x-auth-token', '')

        expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
        expect(msg).toEqual(NO_TOKEN)
      })

      /**
       * Tests PUT /api/tweets/unlike/:tweet_id 404 response
       */
      it('Should not unlike a tweet with an invalid ID', async () => {
        expect.assertions(2) // skipcq: JS-0074
        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put('/api/tweets/unlike/invalidid')
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })

      /**
       * Tests PUT /api/tweets/unlike/:tweet_id 404 response
       */
      it('Should not unlike a tweet that does not exist', async () => {
        expect.assertions(2) // skipcq: JS-0074

        await request(server)
          .delete(`/api/tweets/${tweetId}`)
          .set('x-auth-token', token)

        const {
          statusCode,
          body: { msg }
        } = await request(server)
          .put(`/api/tweets/unlike/${tweetId}`)
          .set('x-auth-token', token)

        expect(statusCode).toEqual(StatusCodes.NOT_FOUND)
        expect(msg).toEqual(TWEET_NOT_FOUND)
      })
    })
  })
})
