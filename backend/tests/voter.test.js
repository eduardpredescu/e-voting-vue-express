const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('./../index')
const {Voter} = require('./../models/voter')
const {User} = require('./../models/user')

const {voters, populateVoters} = require('./seed/voterSeed')
const {users, populateUsers} = require('./seed/userSeed')


beforeEach(populateVoters)
beforeEach(populateUsers)

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
      'username': 'anghel123',
      'password': '1234567'
    }

    request(app)
      .post('/voters')
      .send(voter)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy()
        expect(res.body._id).toBeTruthy()
        expect(res.body.is_admin).toBeFalsy()
      })
      .end((err, res) => {
        if (err) return done(err)
        Voter.findOne({pnc: voter.pnc}).then((voter) => {
          expect(voter).toBeTruthy()
          User.findOne({_id: voter._user.toHexString()}).then((user) => {
            expect(user).toBeTruthy()
            expect(user.password).not.toBe('1234567')
            done()
          }).catch((e) => done(e))
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
      'username': 'ceva',
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
      'username': 'ceva',
      'password': '1234567'
    }

    request(app)
    .post('/voters')
    .send(voter)
    .expect(400)
    .end(done)
  })

  it('should not create a voter if username exists', (done) => {
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
      'username': 'userOne',
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
        username: users[1].username,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy()
      })
      .end((err, res) => {
        if (err) return done(err)

        User.findById(users[1]._id).then((user) => {
          expect(user.toObject().tokens[1]).toMatchObject({
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
      username: users[1].username,
      password: users[1].password + '1'
    })
    .expect(400)
    .end(done)
  })
})

describe('GET /voters/me', () => {
  it('should return voter if authenticated', (done) => {
    request(app)
      .get('/voters/me')
      .set('x-auth', users[1].tokens[0].token)
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

describe('DELETE /voters/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/voters/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done()
        }).catch((e) => done(e))
      })
  })
})
