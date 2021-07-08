const mongoose = require('mongoose')
const request = require('supertest')
const { StatusCodes } = require('http-status-codes')
const server = require('../../../server')
const User = require('../../../models/User')
const Profile = require('../../../models/Profile')
const { testProfile } = require('../../../config')

const testName = 'Test User'
const testBio = 'hello, world!'
const testLocation = 'the test zone'

let token = ''

beforeAll(async () => {
  try {
    await mongoose.connect(testProfile, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })

    console.log('Connected to testProfile')

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
  } catch (err) {
    console.error(err)
  }
})

afterAll(async () => {
  await User.deleteMany()
  await mongoose.connection.close()
})

afterEach(async () => {
  await Profile.deleteMany()
})

describe('Profile testing', () => {
  describe('POST /api/profile (Profile creation)', () => {
    it('Should create a profile', async () => {
      expect.assertions(4) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          name: testName,
          bio: testBio,
          location: testLocation
        })

      expect(res.statusCode).toEqual(StatusCodes.OK)
      expect(res.body.name).toEqual(testName)
      expect(res.body.bio).toEqual(testBio)
      expect(res.body.location).toEqual(testLocation)
    })

    it('Should not create a profile without a name', async () => {
      expect.assertions(2) // skipcq: JS-0074

      const res = await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          bio: testBio,
          location: testLocation
        })

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body.errors[0].msg).toEqual('Name is required')
    })
  })

  describe('GET api/profile/me (Retrieve logged in users profile)', () => {
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

      const res = await request(server)
        .get('/api/profile/me')
        .set('x-auth-token', token)

      expect(res.statusCode).toEqual(StatusCodes.OK)
      expect(res.body.name).toEqual(testName)
      expect(res.body.bio).toEqual(testBio)
      expect(res.body.location).toEqual(testLocation)
    })

    it('Should not allow access without a token', async () => {
      expect.assertions(2) // skipcq: JS-0074

      const res = await request(server).get('/api/profile/me')

      expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(res.body.msg).toEqual('No token, authorization denied')
    })

    it('Should return error message when profile does not exist', async () => {
      expect.assertions(2) // skipcq: JS-0074

      const res = await request(server)
        .get('/api/profile/me')
        .set('x-auth-token', token)

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(res.body.msg).toEqual('There is no profile for this user')
    })
  })

  describe('GET api/profile (Get all profiles)', () => {
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

      res = await request(server).get('/api/profile')

      expect(res.statusCode).toEqual(StatusCodes.OK)
      expect(res.body[0].name).toEqual(testName)
      expect(res.body[0].bio).toEqual(testBio)
      expect(res.body[0].location).toEqual(testLocation)
      expect(res.body[1].name).toEqual(testName2)
      expect(res.body[1].bio).toEqual(testBio2)
      expect(res.body[1].location).toEqual(testLocation2)
    })

    it('Should return an empty array when no profiles exist', async () => {
      const res = await request(server).get('/api/profile')

      expect(res.statusCode).toEqual(StatusCodes.OK)
      expect(res.body.length).toEqual(0)
    })
  })

  describe('GET api/profile/user/:user_id (Get profile by user ID)', () => {
    it('Should return a user profile', async () => {
      expect.assertions(4) // skipcq: JS-0074

      const postRes = await request(server)
        .post('/api/profile')
        .set('Content-Type', 'application/json')
        .set('x-auth-token', token)
        .send({
          name: testName,
          bio: testBio,
          location: testLocation
        })

      const userID = postRes.body.user

      const res = await request(server).get(`/api/profile/user/${userID}`)

      expect(res.statusCode).toEqual(StatusCodes.OK)
      expect(res.body.name).toEqual(testName)
      expect(res.body.bio).toEqual(testBio)
      expect(res.body.location).toEqual(testLocation)
    })
  })
})
