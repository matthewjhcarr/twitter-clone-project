const mongoose = require('mongoose')
const request = require('supertest')
const { StatusCodes } = require('http-status-codes')
const server = require('../../../server')
const User = require('../../../models/User')
const { testAuth } = require('../../../config')

beforeAll(async () => {
  try {
    await mongoose.connect(testAuth, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })

    console.log('Connected to testAuth')
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
describe('User login testing', () => {
  it('Should log an existing user in', async () => {
    expect.assertions(2) // skipcq: JS-0074

    const res = await request(server)
      .post('/api/auth')
      .set('Content-Type', 'application/json')
      .send({
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })

    expect(res.statusCode).toEqual(StatusCodes.OK)
    expect(res.body).toHaveProperty('token')
  })

  it('Should not log a non-existing user in', async () => {
    expect.assertions(3) // skipcq: JS-0074

    const res = await request(server)
      .post('/api/auth')
      .set('Content-Type', 'application/json')
      .send({
        email: 'non.existing.user@gmail.com',
        password: 'fakepass123'
      })

    expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(res.body).not.toHaveProperty('token')
    expect(res.body.errors[0][0].msg).toEqual('Invalid credentials')
  })

  describe('Password testing', () => {
    it('Should not log an existing user in with a wrong password', async () => {
      expect.assertions(3) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send({
          email: 'testuser@gmail.com',
          password: 'fakepass123'
        })

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0][0].msg).toEqual('Invalid credentials')
    })

    it('Should not log an existing user in without a password', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send({
          email: 'testuser@gmail.com'
        })

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0].msg).toEqual('Password is required')
      expect(res.body.errors[0].param).toEqual('password')
      expect(res.body.errors[0].location).toEqual('body')
    })
  })

  describe('Email testing', () => {
    it('Should not log an existing user in with an invalid email', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send({
          email: 'testuser',
          password: 'testpass123'
        })

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0].msg).toEqual('Please include a valid email')
      expect(res.body.errors[0].param).toEqual('email')
      expect(res.body.errors[0].location).toEqual('body')
    })

    it('Should not log an existing user in without an email', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send({
          password: 'testpass123'
        })

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0].msg).toEqual('Please include a valid email')
      expect(res.body.errors[0].param).toEqual('email')
      expect(res.body.errors[0].location).toEqual('body')
    })
  })
})
