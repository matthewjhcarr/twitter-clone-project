const mongoose = require('mongoose')
const request = require('supertest')
const { StatusCodes } = require('http-status-codes')
const server = require('../../../server')
const User = require('../../../models/User')
const { testAuth, ERROR_CODE } = require('../../../config')

/**
 * Executed before all tests. Connects to the auth test database.
 */
beforeAll(async () => {
  try {
    await mongoose.connect(testAuth, {
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
 * Executed after each test. Deletes all users in the database.
 */
afterEach(async () => {
  await User.deleteMany()
})

/**
 * Executed before all tests. Adds a test user to the database.
 * TODO: this method is a duplicate and should be combined with the first beforeAll()
 */
beforeAll(async () => {
  await request(server)
    .post('/api/users')
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test User',
      email: 'testuser@gmail.com',
      password: 'testpass123'
    })
})

/**
 * Tests the user login endpoints.
 */
describe('User login testing', () => {
  /**
   * Tests login endpoint POST /api/auth
   */
  it('Should log an existing user in', async () => {
    expect.assertions(2) // skipcq: JS-0074

    const { statusCode, body } = await request(server)
      .post('/api/auth')
      .set('Content-Type', 'application/json')
      .send({
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })

    expect(statusCode).toEqual(StatusCodes.OK)
    expect(body).toHaveProperty('token')
  })

  /**
   * Tests login endpoint POST /api/auth
   */
  it('Should not log a non-existing user in', async () => {
    expect.assertions(3) // skipcq: JS-0074

    const {
      statusCode,
      body,
      body: {
        errors: [{ msg }]
      }
    } = await request(server)
      .post('/api/auth')
      .set('Content-Type', 'application/json')
      .send({
        email: 'non.existing.user@gmail.com',
        password: 'fakepass123'
      })

    expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(body).not.toHaveProperty('token')
    expect(msg).toEqual('Invalid credentials')
  })

  /**
   * Tests bad password inputs.
   */
  describe('Password testing', () => {
    /**
     * Tests login endpoint POST /api/auth
     */
    it('Should not log an existing user in with a wrong password', async () => {
      expect.assertions(3) // skipcq: JS-0074

      const {
        statusCode,
        body,
        body: {
          errors: [{ msg }]
        }
      } = await request(server)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send({
          email: 'testuser@gmail.com',
          password: 'fakepass123'
        })

      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(body).not.toHaveProperty('token')
      expect(msg).toEqual('Invalid credentials')
    })

    /**
     * Tests login endpoint POST /api/auth
     */
    it('Should not log an existing user in without a password', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const {
        statusCode,
        body,
        body: {
          errors: [{ msg, param, location }]
        }
      } = await request(server)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send({
          email: 'testuser@gmail.com'
        })

      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(body).not.toHaveProperty('token')
      expect(msg).toEqual('Password is required')
      expect(param).toEqual('password')
      expect(location).toEqual('body')
    })
  })

  /**
   * Tests bad email inputs
   */
  describe('Email testing', () => {
    /**
     * Tests login endpoint POST /api/auth
     */
    it('Should not log an existing user in with an invalid email', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const {
        statusCode,
        body,
        body: {
          errors: [{ msg, param, location }]
        }
      } = await request(server)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send({
          email: 'testuser',
          password: 'testpass123'
        })

      expect(statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(body).not.toHaveProperty('token')
      expect(msg).toEqual('Please include a valid email')
      expect(param).toEqual('email')
      expect(location).toEqual('body')
    })

    /**
     * Tests login endpoint POST /api/auth
     */
    it('Should not log an existing user in without an email', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const {
        statusCode,
        body,
        body: {
          errors: [{ msg, param, location }]
        }
      } = await request(server)
        .post('/api/auth')
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
  })
})
