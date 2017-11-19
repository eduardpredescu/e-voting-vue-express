const {ObjectID} = require('mongodb')

const {Event} = require('./../../models/event')

const eventOneId = ObjectID()
const eventTwoId = ObjectID()

const events = [{
  _id: eventOneId,
  name: "Event one",
  due_date: 1605780520000
}, {
  _id: eventTwoId,
  name: "Event two",
  due_date: 1447927720000
}]

const populateEvents = (done) => {
  Event.remove({}).then(() => {
    let eventOne = new Event(events[0]).save()
    let eventTwo = new Event(events[1]).save()

    return Promise.all([eventOne, eventTwo])
  }).then(() => done())
}

module.exports = {events, populateEvents}