const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('./../index')
const {Voter} = require('./../models/voter')

const {voters, populateVoters} = require('./seed/voterSeed')

beforeEach(populateVoters)

describe('POST /voters', () => {
  it('should create a new voter', (done) => {
    let voter = {
      'pnc': '1950811221214',
      'name': 'Anghel',
      'surname': 'Toma',
      'dob': 808099200000,
      'doe': 1597104000000,
      'city': 'Craiova',
      'county': 'DJ',
      'telephone': '0764323213',
      'email': 'anghel@ceva.com',
      'password': '1234567'
    }

    request(app)
      .post('/voters')
      .send(voter)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy()
        expect(res.body._id).toBeTruthy()
        expect(res.body.email).toBe('anghel@ceva.com')
        expect(res.body.name).toBe('Anghel')
        expect(res.body.surname).toBe('Toma')
        expect(res.body.city).toBe('Craiova')
        expect(res.body.county).toBe('DJ')
      })
      .end((err, res) => {
        if (err) return done(err)
        Voter.findOne({pnc: voter.pnc}).then((voter) => {
          expect(voter).toBeTruthy()
          expect(voter.password).not.toBe('1234567')
          done()
        }).catch((e) => done(e))
      })
  })

  it('should return validation errors if request is invalid', (done) => {
    let voter = {
      'pnc': '1950811221214',
      'name': 'Anghel',
      'surname': 'Toma',
      'dob': 808099200000,
      'doe': 1597104000000,
      'city': 'Craiova',
      'county': 'DJ',
      'telephone': '0764323213',
      'email': 'anghel@ceva.com',
      'password': '123'
    }

    request(app)
      .post('/voters')
      .send(voter)
      .expect(400)
      .end(done)
  })

  it('should return an error if ID is expired', (done) => {
    let voter = {
      'pnc': '1950811221214',
      'name': 'Anghel',
      'surname': 'Toma',
      'dob': 808099200000,
      'doe': 1473552000000,
      'city': 'Craiova',
      'county': 'DJ',
      'telephone': '0764323213',
      'email': 'anghel@ceva.com',
      'password': '123456'
    }

    request(app)
    .post('/voters')
    .send(voter)
    .expect(400)
    .end(done)
  })

  it('should return an error if the voter is too young', (done) => {
    let voter = {
      'pnc': '1950811221214',
      'name': 'Anghel',
      'surname': 'Toma',
      'dob': 1511026053000,
      'doe': 1597104000000,
      'city': 'Craiova',
      'county': 'DJ',
      'telephone': '0764323213',
      'email': 'anghel@ceva.com',
      'password': '123456'
    }

    request(app)
    .post('/voters')
    .send(voter)
    .expect(400)
    .end(done)
  })

  it('should not create a voter if email is in use', (done) => {
    let voter = {
      'pnc': '1950811221214',
      'name': 'Anghel',
      'surname': 'Toma',
      'dob': 808099200000,
      'doe': 1597104000000,
      'city': 'Craiova',
      'county': 'DJ',
      'telephone': '0764323213',
      'email': 'ionel@gmail.com',
      'password': '1234567'
    }

    request(app)
    .post('/voters')
    .send(voter)
    .expect(400)
    .end(done)
  })

  it('should not create a voter if pnc exists', (done) => {
    let voter = {
      'pnc': '1990911151223',
      'name': 'Anghel',
      'surname': 'Toma',
      'dob': 808099200000,
      'doe': 1597104000000,
      'city': 'Craiova',
      'county': 'DJ',
      'telephone': '0764323213',
      'email': 'anghel@ceva.com',
      'password': '1234567'
    }

    request(app)
    .post('/voters')
    .send(voter)
    .expect(400)
    .end(done)
  })
})

describe('POST /voters/login', () => {
  it('should authenticate an user', (done) => {
    request(app)
      .post('/voters/login')
      .send({
        email: voters[1].email,
        password: voters[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy()
      })
      .end((err, res) => {
        if (err) return done(err)

        Voter.findById(voters[1]._id).then((voter) => {
          expect(voter.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          })
          done()
        }).catch((e) => done(e))
      })
  })

  it('should reject an invalid user', (done) => {
    request(app)
    .post('/voters/login')
    .send({
      email: voters[1].email,
      password: voters[1].password + '1'
    })
    .expect(400)
    .end(done)
  })
})

describe('GET /voters/me', () => {
  it('should return voter if authenticated', (done) => {
    request(app)
      .get('/voters/me')
      .set('x-auth', voters[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(voters[1]._id.toHexString())
        expect(res.body.email).toBe(voters[1].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/voters/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})
