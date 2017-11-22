const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('./../index')
const {Event} = require('./../models/event')

const {events, populateEvents} = require('./seed/eventSeed')
const {users, populateUsers} = require('./seed/userSeed')

beforeEach(populateUsers)
beforeEach(populateEvents)

describe('GET /events', () => {
  it('should get all events', (done) => {
    request(app)
    .get('/events')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.events.length).toBe(2)
    })
    .end(done)
  })
})

describe('POST /events', () => {
  it('should create a new event', (done) => {
    let testEvent = {
      name: 'event',
      due_date: 1511382048
    }
    request(app)
      .post('/events')
      .set('x-auth', users[0].tokens[0].token)
      .send(testEvent)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(testEvent.name)
        expect(res.body.due_date).toBe(testEvent.due_date)
      })
      .end((err, res) => {
        if (err) return done(err)

        Event.find({name: 'event'}).then((items) => {
          expect(items.length).toBe(1)
          expect(items[0].name).toBe('event')
          expect(items[0].due_date).toBe(1511382048)
          done()
        }).catch((e) => done(e))
      })
  })

  it('should reject an user that is not an admin', (done) => {
    request(app)
      .post('/events')
      .set('x-auth', users[1].tokens[0].token)
      .send(events[0])
      .expect(401)
      .end(done)
  })

  it('should reject an invalid event', (done) => {
    request(app)
      .post('/events')
      .set('x-auth', users[0].tokens[0].token)
      .send({
        name: 'ceva'
      })
      .expect(400)
      .end(done)
  })
})