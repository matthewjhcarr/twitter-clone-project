const mongoose = require('mongoose')
const request = require('supertest')
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
    console.error(err.message)
    // Exit process with failure
    process.exit(1)
  }
})

afterAll(async () => {
  await mongoose.connection.close()
})

afterEach(async () => {
  await User.deleteMany()
})

beforeAll(async () => {
  const res = await request(server)
    .post('/api/users')
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test User',
      email: 'testuser@gmail.com',
      password: 'testpass123'
    })
})

test('Should log an existing user in', async () => {
  expect.assertions(2)

  const res = await request(server)
    .post('/api/auth')
    .set('Content-Type', 'application/json')
    .send({
      email: 'testuser@gmail.com',
      password: 'testpass123'
    })

  expect(res.statusCode).toEqual(200)
  expect(res.body).toHaveProperty('token')
})
