require('./config/config.js')
const _ = require('lodash')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {
  ObjectID
} = require('mongodb')

require('./db/mongoose')
const {
  authenticate
} = require('./middleware/authenticate')
const {
  User
} = require('./models/user')
const {
  Voter
} = require('./models/voter')
const {
  Event
} = require('./models/event')

const app = express()
const port = process.env.PORT

app.use(bodyParser.json())
app.use(cors())

app.post('/api/voters', (req, res) => {
  let body = req.body.voter
  let userBody = req.body.user
  let user = new User(userBody)
  let voter = new Voter(_.merge(body, {
    _user: user._id
  }))
  if (new Date(voter.doe) <= new Date()) return res.status(400).send({
    message: 'Expired ID'
  })
  if (new Date(new Date().getTime() - voter.dob).getUTCFullYear() - 1970 < 18) return res.status(400).send({
    message: 'Voter too young'
  })

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

app.post('/api/voters/login', (req, res) => {
  let body = _.pick(req.body, ['username', 'password'])

  User.findByCredentials(body.username, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user)
    })
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.get('/api/voters/me', authenticate, (req, res) => {
  Voter.findOne({
    _user: req.user._id
  }).then((voter) => {
    res.send(voter)
  }).catch((e) => {
    res.status(404).send(e)
  })

})

app.delete('/api/voters/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }, () => {
    res.status(400).send()
  })
})

app.get('/api/events', authenticate, (req, res) => {
  Event.find().then((events) => {
    res.send({
      events
    })
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.post('/api/events', authenticate, (req, res) => {
  if (!req.user.is_admin) return res.status(401).send()
  let eventBody = new Event(req.body)

  eventBody.save().then((item) => {
    res.send(item)
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.get('/api/events/:id', authenticate, (req, res) => {
  if (!ObjectID.isValid(req.params.id)) return res.status(404).send()

  Event.findOne({
    _id: req.params.id
  }).then((eventItem) => {
    if (!eventItem) return res.status(404).send()

    if (!req.user.is_admin) {
      Voter.findOne({
        _user: req.user._id
      }).then((voter) => {
        if (!voter) return res.status(404).send()
        eventItem.options = eventItem.options.filter((item) => item.county === voter.county)
        res.send({
          eventItem
        })
      }).catch((e) => res.status(400).send(e))
    } else res.send({eventItem})
  }).catch((e) => res.status(400).send(e))
})

app.patch('/api/events/:id', authenticate, (req, res) => {
  if (!ObjectID.isValid(req.params.id)) return res.status(404).send()
  if (!req.user.is_admin) return res.status(401).send()

  Event.findOneAndUpdate({
    _id: req.params.id
  }, {
    $set: req.body
  }, {
    new: true
  }).then((eventItem) => {
    if (!eventItem) return res.status(404).send()

    res.send({
      eventItem
    })
  }).catch((e) => res.status(400).send(e))
})

app.delete('/api/events/:id', authenticate, (req, res) => {
  if (!ObjectID.isValid(req.params.id)) return res.status(404).send()
  if (!req.user.is_admin) return res.status(401).send()

  Event.findByIdAndRemove({
    _id: req.params.id
  }).then((eventItem) => {
    if (!eventItem) return res.status(404).send()

    res.send({
      eventItem
    })
  }).catch((e) => res.status(400).send(e))
})

app.get('/api/voters/events', authenticate, (req, res) => {
  if(req.user.is_admin) return res.status(401).send()

  Voter.findOne({
    _user: req.user._id
  }).then((voter) => {
    if(!voter) return res.status(400).send(e)

    Event.find({
      _id: {
        $in: voter.events.map(item => item._event.toHexString())
      }
    }).then((eventItems) => {
      eventItems.forEach((eventItem) => {
        eventItem.options = eventItem.options.filter(option => voter.events.map(voterOption => voterOption._option.toHexString()).indexOf(option._id.toHexString()) > -1)
      })
      res.send(eventItems)
    }).catch((e) => res.status(404).send(e))
  }).catch((e) => res.status(400).send(e))
})

app.patch('/api/voters/events/:id', authenticate, (req, res) => {
  if(req.user.is_admin) return res.status(401).send()

  Voter.findOneAndUpdate({
    _user: req.user._id,
    'events._event': req.params.id
  }, {
    $set: {
      'events.$._option': req.body._option
    }
  },{
    new: true
  }).then((voter) => {
    if(!voter) return res.status(404).send()
    res.send({voter})
  }).catch((e) => res.status(400).send(e))
})

app.post('/api/voters/events', authenticate, (req, res) => {
  if(req.user.is_admin) return res.status(401).send()

  Voter.findOneAndUpdate({
    _user: req.user._id
  }, {
    $push: {
      events: req.body
    }
  }, {
    new: true
  }).then((voter) => {
    if(!voter) return res.status(404).send()

    res.send({voter})
  }).catch((e) => res.status(400).send(e))
})

app.listen(port, () => {
  console.log(`Started up at port ${port}`)
})

module.exports = {
  app
}
