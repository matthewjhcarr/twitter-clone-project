const mongoose = require('mongoose')
const request = require('supertest')
const { StatusCodes } = require('http-status-codes')
const server = require('../../../server')
const User = require('../../../models/User')
const Profile = require('../../../models/Profile')
const { testUsers, ERROR_CODE } = require('../../../config')

/**
 * Executed before all tests. Connects to the users test database.
 */
beforeAll(async () => {
  try {
    await mongoose.connect(testUsers, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
  } catch (err) {
    // Exit process with failure
    process.exit(ERROR_CODE)
  }
})

/**
 * Executed after all tests. Closes the connection to auth test database.
 */
afterAll(async () => {
  await mongoose.connection.close()
})

/**
 * Executed after each test. Deletes all users from the database.
 */
afterEach(async () => {
  await User.deleteMany()
})

/**
 * Tests user registration endpoints.
 */
describe('Registration testing', () => {
  /**
   * Tests the POST /api/users endpoint.
   */
  it('Should create a test user', async () => {
    expect.assertions(2) // skipcq: JS-0074

    const { statusCode, body } = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send({
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })
    expect(statusCode).toEqual(StatusCodes.OK)
    expect(body).toHaveProperty('token')
  })

  /**
   * Tests bad email inputs.
   */
  describe('Test email param', () => {
    /**
     * Tests the POST /api/users endpoint.
     */
    it('Should not create a test user without an email', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const {
        statusCode,
        body,
        body: {
          errors: [{ msg, param, location }]
        }
      } = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          password: 'testpass123'
        })
      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(body).not.toHaveProperty('token')
      expect(msg).toEqual('Please include a valid email')
      expect(param).toEqual('email')
      expect(location).toEqual('body')
    })

    /**
     * Tests the POST /api/users endpoint.
     */
    it('Should not create a test user with an invalid email', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const {
        statusCode,
        body,
        body: {
          errors: [{ msg, param, location }]
        }
      } = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          email: 'baduser',
          password: 'testpass123'
        })
      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(body).not.toHaveProperty('token')
      expect(msg).toEqual('Please include a valid email')
      expect(param).toEqual('email')
      expect(location).toEqual('body')
    })
  })

  /**
   * Tests bad password inputs
   */
  describe('Test password param', () => {
    /**
     * Tests the POST /api/users endpoint.
     */
    it('Should not create a test user without a password', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const {
        statusCode,
        body,
        body: {
          errors: [{ msg, param, location }]
        }
      } = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          email: 'baduser@gmail.com'
        })
      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(body).not.toHaveProperty('token')
      expect(msg).toEqual('Please enter a password with 6 or more characters')
      expect(param).toEqual('password')
      expect(location).toEqual('body')
    })

    /**
     * Tests the POST /api/users endpoint.
     */
    it('Should not create a test user with an invalid password', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const {
        statusCode,
        body,
        body: {
          errors: [{ msg, param, location }]
        }
      } = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          email: 'baduser@gmail.com',
          password: '1234'
        })
      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(body).not.toHaveProperty('token')
      expect(msg).toEqual('Please enter a password with 6 or more characters')
      expect(param).toEqual('password')
      expect(location).toEqual('body')
    })
  })
})

/**
 * Tests the user delete endpoint
 */
describe('Delete user testing', () => {
  let token = ''

  /**
   * Executed before each test in this block. Creates a test user.
   */
  beforeEach(async () => {
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

    await request(server)
      .post('/api/profile')
      .set('Content-Type', 'application/json')
      .set('x-auth-token', token)
      .send({
        name: 'test name',
        bio: 'test bio',
        location: 'test location'
      })
  })

  afterEach(async () => {
    await Profile.deleteMany()
  })

  /**
   * Tests the DELETE /api/users endpoint.
   */
  it('Should delete the test user', async () => {
    expect.assertions(6) // skipcq: JS-0074

    // Send delete request
    const {
      statusCode: userStatusCode,
      body: { msg: userMsg }
    } = await request(server).delete('/api/users').set('x-auth-token', token)

    expect(userStatusCode).toEqual(StatusCodes.OK)
    expect(userMsg).toEqual('User deleted')

    // Assert profile has been deleted
    const { statusCode: profileStatusCode, body } = await request(server).get(
      '/api/profile'
    )

    expect(profileStatusCode).toEqual(StatusCodes.OK)
    expect(body).toEqual([])

    // Assert user has been deleted
    const {
      statusCode: authStatusCode,
      body: {
        errors: [{ msg: authMsg }]
      }
    } = await request(server)
      .post('/api/auth')
      .set('Content-Type', 'application/json')
      .send({
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })

    expect(authStatusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(authMsg).toEqual('Invalid credentials')
  })

  /**
   * Tests the DELETE /api/users endpoint.
   */
  it('Should not delete the user if given no token', async () => {
    expect.assertions(6) // skipcq: JS-0074

    // Send delete request
    const {
      statusCode: userStatusCode,
      body: { msg }
    } = await request(server).delete('/api/users').set('x-auth-token', '')

    expect(userStatusCode).toEqual(StatusCodes.UNAUTHORIZED)
    expect(msg).toEqual('No token, authorization denied')

    // Assert profile has not been deleted
    const {
      statusCode: profileStatusCode,
      body: [{ name }]
    } = await request(server).get('/api/profile')

    expect(profileStatusCode).toEqual(StatusCodes.OK)
    expect(name).toEqual('test name')

    // Assert user has not been deleted
    const { statusCode: authStatusCode, body } = await request(server)
      .post('/api/auth')
      .set('Content-Type', 'application/json')
      .send({
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })

    expect(authStatusCode).toEqual(StatusCodes.OK)
    expect(body).toHaveProperty('token')
  })
})
