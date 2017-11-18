require('./config/config.js')
const _ = require('lodash')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {ObjectID} = require('mongodb')

require('./db/mongoose')
const {authenticate} = require('./middleware/authenticate')
let {Voter} = require('./models/voter')

let app = express()
const port = process.env.PORT

app.use(bodyParser.json())
app.use(cors())

app.post('/voters', (req, res) => {
  let voter = new Voter(req.body)
  if (new Date(voter.doe) <= new Date()) return res.status(400).send({message: 'Expired ID'})
  if (new Date(new Date().getTime() - voter.dob).getUTCFullYear() - 1970 < 18) return res.status(400).send({message: 'Voter too young'})


  voter.save().then((voter) => {
    return voter.generateAuthToken()
  }).then((token) => {
    res.header('x-auth', token).send(voter)
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.post('/voters/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password'])

  Voter.findByCredentials(body.email, body.password).then((voter) => {
    return voter.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(voter)
    })
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.get('/voters/me', authenticate, (req, res) => {
  res.send(req.voter)
})

app.listen(port, () => {
  console.log(`Started up at port ${port}`)
})

module.exports = {app}
