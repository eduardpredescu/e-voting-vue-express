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

  return _.pick(voterObject, ['_id', 'email', 'name', 'surname', 'city', 'county'])
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

VoterSchema.statics.findByToken = function (token) {
  let Voter = this
  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    return Promise.reject()
  }

  return Voter.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

VoterSchema.statics.findByCredentials = function (email, password) {
  let Voter = this

  return Voter.findOne({email}).then((voter) => {
    if(!voter) return Promise.reject()

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, voter.password, (err, res) => {
        if (res) resolve(voter)
        else reject()
      })
    })
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
