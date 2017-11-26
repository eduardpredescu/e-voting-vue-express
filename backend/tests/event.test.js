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

describe('GET /events/:id', () => {
  it('should return an event', (done) => {
    request(app)
      .get(`/events/${events[0]._id.toHexString()}/`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.eventItem.name).toBe(events[0].name)
        expect(res.body.eventItem.due_date).toBe(events[0].due_date)
        expect(res.body.eventItem.options.length).toBe(events[0].options.length)
      })
      .end(done)
  })

  it('should return 404 if not found', (done) => {
    request(app)
    .get(`/events/${new ObjectID().toHexString()}/`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done)
  })

  it('should return 404 for non Object IDs', (done) => {
    request(app)
    .get('/events/123')
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done)
  })
})

describe('PATCH /events/:id', () => {
  let name = 'New Event'
  let options = [{
    name: 'option 1',
    county: 'DB'
  }]
  let newEvent = Object.assign({}, events[0])
  newEvent.name = name
  newEvent.options = options

  it('should update an event', (done) => {
    request(app)
      .patch(`/events/${events[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(newEvent)
      .expect(200)
      .expect((res) => {
        expect(res.body.eventItem.name).toBe(name)
        expect(res.body.eventItem.options.length).toBe(1)
      })
      .end(done)
  })

  it('should deny patch to a non admin', (done) => {
    request(app)
    .patch(`/events/${events[0]._id.toHexString()}`)
    .set('x-auth', users[1].tokens[0].token)
    .send(newEvent)
    .expect(401)
    .end(done)
  })
})

describe('DELETE /events/:id', () => {
  it('should delete and return an event', (done) => {
    request(app)
      .delete(`/events/${events[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.eventItem._id).toBe(events[0]._id.toHexString())
      })
      .end((err, res) => {
        if (err) return done(err)

        Event.findById({_id: events[0]._id.toHexString()}).then((eventItem) => {
          expect(eventItem).toBeFalsy()
          done()
        }).catch((e) => done(e))
      })
  })

  it('should deny access for a non admin', (done) => {
    request(app)
    .delete(`/events/${events[0]._id.toHexString()}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(401)
    .end(done)
  })

  it('should return 404 for a non existent event', (done) => {
    request(app)
    .delete(`/events/${new ObjectID().toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done)
  })

  it('should return 404 for a non-object ID', (done) => {
    request(app)
    .delete('/events/123')
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done)
  })
})