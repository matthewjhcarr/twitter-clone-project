const mongoose = require('mongoose')
const request = require('supertest')
const { StatusCodes } = require('http-status-codes')
const server = require('../../../server')
const User = require('../../../models/User')
const Profile = require('../../../models/Profile')
const { testProfile, ERROR_CODE } = require('../../../config')

const testName = 'Test User'
const testBio = 'hello, world!'
const testLocation = 'the test zone'

let token = ''

/**
 * Executed before all tests. Connects to the profile test database and creates a test user.
 */
beforeAll(async () => {
  try {
    await mongoose.connect(testProfile, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })

    const {
      body: { token: resToken }
    } = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send({
        username: 'testuser',
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })

    token = resToken
  } catch (err) {
    // Exit process with failure
    process.exit(ERROR_CODE)
  }
})

/**
 * Executed after all tests. Closes the connection to auth test database and deletes any users in the database.
 */
afterAll(async () => {
  await User.deleteMany()
  await mongoose.connection.close()
})

/**
 * Executed after each test. Deletes all profiles from the database.
 */
afterEach(async () => {
  await Profile.deleteMany()
})

/**
 * Tests the profile endpoints.
 */
describe('Profile testing', () => {
  /**
   * Tests profile creation on the POST /api/profile endpoint
   */
  describe('POST /api/profile (Profile creation)', () => {
    /**
     * Tests the POST /api/profile endpoint
     */
    it('Should create a profile', async () => {
      expect.assertions(4) // skipcq: JS-0074

      const {
        statusCode,
        body: { name, bio, location }
      } = await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          name: testName,
          bio: testBio,
          location: testLocation
        })

      expect(statusCode).toEqual(StatusCodes.OK)
      expect(name).toEqual(testName)
      expect(bio).toEqual(testBio)
      expect(location).toEqual(testLocation)
    })

    /**
     * Tests the POST /api/profile endpoint
     */
    it('Should not create a profile without a name', async () => {
      expect.assertions(2) // skipcq: JS-0074

      const {
        statusCode,
        body: {
          errors: [{ msg }]
        }
      } = await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          bio: testBio,
          location: testLocation
        })

      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(msg).toEqual('Name is required')
    })
  })

  /**
   * Tests the retrieval of the logged in user's profile on the GET /api/profile/me endpoint
   */
  describe('GET /api/profile/me (Retrieve logged in users profile)', () => {
    /**
     * Tests the GET api/profile/me endpoint
     */
    it('Should retrieve current users profile', async () => {
      expect.assertions(4) // skipcq: JS-0074
      // Create profile
      await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          name: testName,
          bio: testBio,
          location: testLocation
        })

      const {
        statusCode,
        body: { name, bio, location }
      } = await request(server)
        .get('/api/profile/me')
        .set('x-auth-token', token)

      expect(statusCode).toEqual(StatusCodes.OK)
      expect(name).toEqual(testName)
      expect(bio).toEqual(testBio)
      expect(location).toEqual(testLocation)
    })

    /**
     * Tests the GET /api/profile/me endpoint
     */
    it('Should not allow access without a token', async () => {
      expect.assertions(2) // skipcq: JS-0074

      const {
        statusCode,
        body: { msg }
      } = await request(server).get('/api/profile/me')

      expect(statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(msg).toEqual('No token, authorization denied')
    })

    /**
     * Tests the GET /api/profile/me endpoint
     */
    it('Should return error message when profile does not exist', async () => {
      expect.assertions(2) // skipcq: JS-0074

      const {
        statusCode,
        body: { msg }
      } = await request(server)
        .get('/api/profile/me')
        .set('x-auth-token', token)

      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(msg).toEqual('There is no profile for this user')
    })
  })

  /**
   * Tests the retrieval of all profiles on the GET /api/profile
   */
  describe('GET /api/profile (Get all profiles)', () => {
    /**
     * Tests the GET /api/profile endpoint
     */
    it('Should return two profiles', async () => {
      expect.assertions(7) // skipcq: JS-0074

      const testName2 = 'Other Name'
      const testBio2 = 'Other Bio'
      const testLocation2 = 'Other Location'

      // Register another user
      const {
        body: { token: token2 }
      } = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          username: 'testuser2',
          email: 'testuser2@gmail.com',
          password: 'testpass123'
        })

      // Create first profile
      await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          name: testName,
          bio: testBio,
          location: testLocation
        })

      // Create second profile
      await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token2)
        .send({
          name: testName2,
          bio: testBio2,
          location: testLocation2
        })

      const {
        statusCode,
        body: [
          { name: name1, bio: bio1, location: location1 },
          { name: name2, bio: bio2, location: location2 }
        ]
      } = await request(server).get('/api/profile')

      expect(statusCode).toEqual(StatusCodes.OK)
      expect(name1).toEqual(testName)
      expect(bio1).toEqual(testBio)
      expect(location1).toEqual(testLocation)
      expect(name2).toEqual(testName2)
      expect(bio2).toEqual(testBio2)
      expect(location2).toEqual(testLocation2)
    })

    /**
     * Tests the GET /api/profile endpoint
     */
    it('Should return an empty array when no profiles exist', async () => {
      const { statusCode, body } = await request(server).get('/api/profile')

      expect(statusCode).toEqual(StatusCodes.OK)
      expect(body.length).toEqual(0)
    })
  })

  /**
   * Tests the retrieval of profiles by user ID on the GET /api/profile/user/:user_id endpoint
   */
  describe('GET /api/profile/user/:user_id (Get profile by user ID)', () => {
    /**
     * Tests the GET /api/profile/user/:user_id endpoint
     */
    it('Should return a user profile', async () => {
      expect.assertions(4) // skipcq: JS-0074

      const {
        body: { user: userID }
      } = await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          name: testName,
          bio: testBio,
          location: testLocation
        })

      const {
        statusCode,
        body: { name, bio, location }
      } = await request(server).get(`/api/profile/user/${userID}`)

      expect(statusCode).toEqual(StatusCodes.OK)
      expect(name).toEqual(testName)
      expect(bio).toEqual(testBio)
      expect(location).toEqual(testLocation)
    })
  })
})
