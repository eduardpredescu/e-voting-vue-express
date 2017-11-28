const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('./../index')
const {Voter} = require('./../models/voter')
const {User} = require('./../models/user')

const {voters, populateVoters} = require('./seed/voterSeed')
const {users, populateUsers} = require('./seed/userSeed')
const {events, populateEvents} = require('./seed/eventSeed')


beforeEach(populateVoters)
beforeEach(populateUsers)
beforeEach(populateEvents)

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
      'email': 'anghel@ceva.com'
    }
    let user = {
      'username': 'anghel123',
      'password': '1234567'
    }

    request(app)
      .post('/api/voters')
      .send({voter,user})
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
      'email': 'anghel@ceva.com'
    }
    let user = {
      'username': 'anghel123',
      'password': '123'
    }

    request(app)
      .post('/api/voters')
      .send({voter, user})
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
      'email': 'anghel@ceva.com'
    }
    let user = {
      'username': 'anghel123',
      'password': '1234567'
    }

    request(app)
    .post('/api/voters')
    .send({voter, user})
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
    }
    let user = {
      'username': 'anghel123',
      'password': '1234567'
    }

    request(app)
    .post('/api/voters')
    .send({voter, user})
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
      'username': 'ceva'
    }
    let user = {
      'username': 'anghel123',
      'password': '1234567'
    }

    request(app)
    .post('/api/voters')
    .send({voter, user})
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
      'email': 'anghel@ceva.com'
    }
    let user = {
      'username': 'anghel123',
      'password': '1234567'
    }

    request(app)
    .post('/api/voters')
    .send({voter, user})
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
      'email': 'anghel@ceva.com'
    }
    let user = {
      'username': 'userOne',
      'password': '1234567'
    }

    request(app)
    .post('/api/voters')
    .send({voter, user})
    .expect(400)
    .end(done)
  })
})

describe('POST /voters/login', () => {
  it('should authenticate an user', (done) => {
    request(app)
      .post('/api/voters/login')
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
    .post('/api/voters/login')
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
      .get('/api/voters/me')
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
      .get('/api/voters/me')
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
      .delete('/api/voters/me/token')
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

describe('GET /voters/events', () => {
  it('should return the events on which the voter expressed his option', (done) => {
    request(app)
      .get('/api/voters/events')
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1)
        expect(res.body[0].options.length).toBe(1)
      })
      .end(done)
  })

  it('should deny an admin from accessing', (done) => {
    request(app)
    .get('/api/voters/events')
    .set('x-auth', users[0].tokens[0].token)
    .expect(401)
    .end(done)
  })
})

describe('PATCH /voters/events/:id', () => {
  it('should update an option for a voter', (done) => {
    request(app)
      .patch(`/api/voters/events/${voters[1].events[0]._event.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({_option: events[0].options[1]._id.toHexString()})
      .expect(200)
      .expect((res) => {
        expect(res.body.voter.events[0]._option).toBe(events[0].options[1]._id.toHexString())
      })
      .end((err, res) => {
        if (err) return done(err)

        Voter.findOne({_user: users[1]._id}).then((voter) => {
          expect(voter.events[0]._option.toHexString()).toBe(events[0].options[1]._id.toHexString())
          done()
        }).catch((e) => done(e))
      })
  })

  it('should return 404 if event does not exist', (done) => {
    request(app)
    .patch(`/api/voters/events/${new ObjectID().toHexString()}`)
    .set('x-auth', users[1].tokens[0].token)
    .send({_option: events[0].options[1]._id.toHexString()})
    .expect(404)
    .end(done)
  })

  it('should return 400 for non object IDs', (done) => {
    request(app)
    .patch('/api/voters/events/123')
    .set('x-auth', users[1].tokens[0].token)
    .send({_option: events[0].options[1]._id.toHexString()})
    .expect(400)
    .end(done)
  })
})

describe('POST /voters/events', () => {
  it('should return the voter with an updated event array', (done) => {
    request(app)
      .post('/api/voters/events')
      .set('x-auth', users[1].tokens[0].token)
      .send({_event: events[1]._id.toHexString(), _option: events[1].options[0]._id.toHexString()})
      .expect(200)
      .expect((res) => {
        expect(res.body.voter.events[1]._event).toBe(events[1]._id.toHexString())
      })
      .end((err, res) => {
        if (err) return done(err)

        Voter.findOne({_user: users[1]._id}).then((voter) => {
          expect(voter.events[1]._event.toHexString()).toBe(events[1]._id.toHexString())
          expect(voter.events[1]._option.toHexString()).toBe(events[1].options[0]._id.toHexString())
          done()
        }).catch(e => done(e))
      })
  })
})
