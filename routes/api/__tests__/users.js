const mongoose = require('mongoose')
const request = require('supertest')
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

it('Should create a test user', async () => {
  expect.assertions(2)

  const res = await request(server)
    .post('/api/users')
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test User',
      email: 'testuser@gmail.com',
      password: 'testpass123'
    })
  expect(res.statusCode).toEqual(200)
  expect(res.body).toHaveProperty('token')
})

it('Should delete the test user', async () => {
  expect.assertions(2)

  let res = await request(server)
    .post('/api/users')
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test User',
      email: 'testuser@gmail.com',
      password: 'testpass123'
    })

  const token = res.body.token

  res = await request(server).delete('/api/users').set('x-auth-token', token)
  expect(res.statusCode).toEqual(200)
  expect(res.body.msg).toEqual('User deleted')
})
