const mongoose = require('mongoose')
const request = require('supertest')
const { StatusCodes } = require('http-status-codes')
const server = require('../../../server')
const User = require('../../../models/User')
const { testUsers } = require('../../../config')

beforeAll(async () => {
  try {
    await mongoose.connect(testUsers, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })

    console.log('Connected to testUsers')
  } catch (err) {
    console.error(err)
  }
})

afterAll(async () => {
  await mongoose.connection.close()
})

afterEach(async () => {
  await User.deleteMany()
})

describe('Registration testing', () => {
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

  describe('Test email param', () => {
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

  describe('Test password param', () => {
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

describe('Delete user testing', () => {
  let token = ''

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
  })

  it('Should delete the test user', async () => {
    expect.assertions(2) // skipcq: JS-0074

    const {
      statusCode,
      body: { msg }
    } = await request(server).delete('/api/users').set('x-auth-token', token)
    expect(statusCode).toEqual(StatusCodes.OK)
    expect(msg).toEqual('User deleted')
  })
})
