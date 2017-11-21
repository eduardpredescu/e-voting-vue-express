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