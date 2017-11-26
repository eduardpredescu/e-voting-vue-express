const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

let VoterSchema = new mongoose.Schema({
  pnc: {
    type: String,
    required: true,
    unique: true,
    length: 13
  },
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  dob: {
    type: Number,
    required: true
  },
  doe: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  county: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true,
    length: 10
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  events: [{
    _event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    _option: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  }],
  _user: {
    type: mongoose.Schema.Types.ObjectId
  }
})
let Voter = mongoose.model('Voter', VoterSchema)

module.exports = {Voter}
