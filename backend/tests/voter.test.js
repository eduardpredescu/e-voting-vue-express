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

  })

  it('should return an error if ID is expired', (done) => {

  })

  it('should return an error if the voter is too young', (done) => {

  })

  it('should not create a voter if email is in use', (done) => {

  })

  it('should not create a voter if pnc exists', (done) => {

  })
})