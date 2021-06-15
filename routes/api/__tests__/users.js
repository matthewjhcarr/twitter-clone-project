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

    const res = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Test User',
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })
    expect(res.statusCode).toEqual(StatusCodes.OK)
    expect(res.body).toHaveProperty('token')
  })

  describe('Test name param', () => {
    it('Should not create a test user without a name', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          email: 'baduser@gmail.com',
          password: 'testpass123'
        })
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0].msg).toEqual('Name is required!')
      expect(res.body.errors[0].param).toEqual('name')
      expect(res.body.errors[0].location).toEqual('body')
    })
  })

  describe('Test email param', () => {
    it('Should not create a test user without an email', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Bad User',
          password: 'testpass123'
        })
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0].msg).toEqual('Please include a valid email')
      expect(res.body.errors[0].param).toEqual('email')
      expect(res.body.errors[0].location).toEqual('body')
    })

    it('Should not create a test user with an invalid email', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Bad User',
          email: 'baduser',
          password: 'testpass123'
        })
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0].msg).toEqual('Please include a valid email')
      expect(res.body.errors[0].param).toEqual('email')
      expect(res.body.errors[0].location).toEqual('body')
    })
  })

  describe('Test password param', () => {
    it('Should not create a test user without a password', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Bad User',
          email: 'baduser@gmail.com'
        })
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0].msg).toEqual(
        'Please enter a password with 6 or more characters'
      )
      expect(res.body.errors[0].param).toEqual('password')
      expect(res.body.errors[0].location).toEqual('body')
    })

    it('Should not create a test user with an invalid password', async () => {
      expect.assertions(5) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Bad User',
          email: 'baduser@gmail.com',
          password: '1234'
        })
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body).not.toHaveProperty('token')
      expect(res.body.errors[0].msg).toEqual(
        'Please enter a password with 6 or more characters'
      )
      expect(res.body.errors[0].param).toEqual('password')
      expect(res.body.errors[0].location).toEqual('body')
    })
  })
})

describe('Delete user testing', () => {
  let token = ''

  beforeEach(async () => {
    const res = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Test User',
        email: 'testuser@gmail.com',
        password: 'testpass123'
      })

    token = res.body.token
  })

  it('Should delete the test user', async () => {
    expect.assertions(2) // skipcq: JS-0074

    const res = await request(server)
      .delete('/api/users')
      .set('x-auth-token', token)
    expect(res.statusCode).toEqual(StatusCodes.OK)
    expect(res.body.msg).toEqual('User deleted')
  })
})
