const {ObjectID} = require('mongodb')

const {Voter} = require('./../../models/voter')

const {users} = require('./userSeed')
const {events} = require('./eventSeed')

const voterOneId = new ObjectID()
const voterOneEmail = 'ionel@gmail.com'
const voterTwoId = new ObjectID()
const voterTwoEmail = 'gigel@gmail.com'

const voters = [{
  _id: voterOneId,
  pnc: '1990911151223',
  name: 'Ionel',
  surname: 'Niculae',
  dob: 937008000000,
  doe: 1473552000000,
  city: 'Bucharest',
  county: 'B',
  telephone: '0764323445',
  email: voterOneEmail,
  password: '1234567',
  events: [],
  _user: users[0]._id
}, {
  _id: voterTwoId,
  pnc: '1950811151223',
  name: 'Gige',
  surname: 'Marian',
  dob: 808099200000,
  doe: 1597104000000,
  city: 'Targoviste',
  county: 'DB',
  telephone: '0764323225',
  email: voterTwoEmail,
  password: '1234567',
  events: [{
    _event: events[0]._id,
    _option: events[0].options[0]._id
  }],
  _user: users[1]._id
}]

const populateVoters = (done) => {
  Voter.remove({}).then(() => {
    let voterOne = new Voter(voters[0]).save()
    let voterTwo = new Voter(voters[1]).save()

    return Promise.all([voterOne, voterTwo])
  }).then(() => done())
}

module.exports = {voters, populateVoters}
