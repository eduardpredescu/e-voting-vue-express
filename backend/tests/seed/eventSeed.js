const {ObjectID} = require('mongodb')

const {Event} = require('./../../models/event')

const eventOneId = ObjectID()
const eventTwoId = ObjectID()
const optionOneId = new ObjectID()
const optionTwoId = new ObjectID()
const optionThreeId = new ObjectID()

const events = [{
  _id: eventOneId,
  name: "Event one",
  due_date: 1605780520000,
  options: [{
    _id: optionOneId,
    name: 'option 1',
    county: 'DB'
  }, {
    _id: optionTwoId,
    name: 'option 2',
    county: 'DB'
  }, {
    _id: optionThreeId,
    name: 'option 3',
    county: 'DJ'
  }]
}, {
  _id: eventTwoId,
  name: "Event two",
  due_date: 1447927720000,
  options: [{
    _id: optionOneId,
    name: 'option 1'
  }, {
    _id: optionTwoId,
    name: 'option 2'
  }]
}]

const populateEvents = (done) => {
  Event.remove({}).then(() => {
    let eventOne = new Event(events[0]).save()
    let eventTwo = new Event(events[1]).save()

    return Promise.all([eventOne, eventTwo])
  }).then(() => done())
}

module.exports = {events, populateEvents}