require('./config/config.js')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {ObjectID} = require('mongodb')

const {mongoose} = require('./db/mongoose')
let {Voter} = require('./models/voter')

let app = express()
const port = process.env.PORT

app.use(bodyParser.json())
app.use(cors())

app.listen(port, () => {
  console.log(`Started up at port ${port}`)
})

module.exports = {app}
