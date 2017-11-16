require('./config/config.js')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {ObjectID} = require('mongodb')

require('./db/mongoose')
let {Voter} = require('./models/voter')

let app = express()
const port = process.env.PORT

app.use(bodyParser.json())
app.use(cors())

app.post('/voters', (req, res) => {
  let voter = new Voter(req.body)

  voter.save().then((voter) => {
    return voter.generateAuthToken()
  }).then((token) => {
    res.header('x-auth', token).send(voter)
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.listen(port, () => {
  console.log(`Started up at port ${port}`)
})

module.exports = {app}
