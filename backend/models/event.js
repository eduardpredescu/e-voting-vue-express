const mongoose = require('mongoose')

let Event = mongoose.model('Event', new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  due_date: {
    type: Number,
    required: true
  },
  options: [{
    name: {
      type: String,
      required: true
    },
    party: {
      type: String
    },
    county: {
      type: String
    }
  }]
}))

module.exports = {Event}