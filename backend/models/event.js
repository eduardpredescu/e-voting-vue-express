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
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
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