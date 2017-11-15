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
    maxlength: 13
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
    maxlength: 10
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
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }],
  events: [{
    _event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    option: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  }]
})

VoterSchema.methods.toJSON = function () {
  let voter = this
  let voterObject = voter.toObject()

  return _.pick(voterObject, ['_id', 'email'])
}

VoterSchema.methods.generateAuthToken = function () {
  let voter = this
  let access = 'auth'
  let token = jwt.sign({_id: voter._id.toHexString(), email: voter.email, access}, process.env.JWT_SECRET).toString()

  voter.tokens.push({
    access,
    token
  })

  return voter.save().then(() => {
    return token
  })
}

VoterSchema.methods.removeToken = function (token) {
  let voter = this

  return voter.update({
    $pull: {
      tokens: {token}
    }
  })
}

VoterSchema.pre('save', function (next) {
  let voter = this

  if (voter.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err)
      bcrypt.hash(voter.password, salt, (err, hash) => {
        if (err) return next(err)
        voter.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

let Voter = mongoose.model('Voter', VoterSchema)

module.exports = {Voter}
