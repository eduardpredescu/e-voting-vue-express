require('./config/config.js')
const _ = require('lodash')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {ObjectID} = require('mongodb')

require('./db/mongoose')
const {authenticate} = require('./middleware/authenticate')
const {User} = require('./models/user')
const {Voter} = require('./models/voter')
const {Event} = require('./models/event')

const app = express()
const port = process.env.PORT

app.use(bodyParser.json())
app.use(cors())

app.post('/voters', (req, res) => {
  let body = _.pick(req.body, ['pnc', 'name', 'surname', 'dob', 'doe', 'city', 'county', 'telephone', 'email'])
  let userBody = _.pick(req.body, ['username', 'password'])
  let user = new User(userBody)
  let voter = new Voter(_.merge(body, {_user: user._id}))
  if (new Date(voter.doe) <= new Date()) return res.status(400).send({message: 'Expired ID'})
  if (new Date(new Date().getTime() - voter.dob).getUTCFullYear() - 1970 < 18) return res.status(400).send({message: 'Voter too young'})

  user.save().then((user) => {
    return user.generateAuthToken()
  }).then((token) => {
    voter.save().then((voter) => {
      res.header('x-auth', token).send(user)
    }).catch((e) => {
      res.status(400).send(e)
    })
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.post('/voters/login', (req, res) => {
  let body = _.pick(req.body, ['username', 'password'])

  User.findByCredentials(body.username, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user)
    })
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.get('/voters/me', authenticate, (req, res) => {
  Voter.findOne({_user: req.user._id}).then((voter) => {
    res.send(voter)
  }).catch((e) => {
    res.status(404).send(e)
  })

})

app.delete('/voters/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }, () => {
    res.status(400).send()
  })
})

app.get('/events', authenticate, (req, res) => {
  Event.find().then((events) => {
    res.send({events})
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.post('/events', authenticate, (req, res) => {
  if (!req.user.is_admin) return res.status(401).send()
  let eventBody = new Event(req.body)

  eventBody.save().then((item) => {
    res.send(item)
  }).catch((e) => {res.status(400).send(e)})
})

app.listen(port, () => {
  console.log(`Started up at port ${port}`)
})

module.exports = {app}
