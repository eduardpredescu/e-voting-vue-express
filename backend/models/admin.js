const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

let AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
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
  }]
})

AdminSchema.methods.toJSON = function () {
  let admin = this
  let adminObject = admin.toObject()

  return _.pick(adminObject, ['_id', 'username'])
}

AdminSchema.methods.generateAuthToken = function () {
  let admin = this
  let access = 'auth'
  let token = jwt.sign({_id: admin._id.toHexString(), username: admin.username, access}, process.env.JWT_SECRET).toString()

  admin.tokens.push({
    access,
    token
  })

  return admin.save().then(() => {
    return token
  })
}

AdminSchema.methods.removeToken = function (token) {
  let admin = this

  return admin.update({
    $pull: {
      tokens: {token}
    }
  })
}

AdminSchema.statics.findByToken = function (token) {
  let admin = this
  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    return Promise.reject()
  }

  return admin.findOne({
    '_id': decoded._id,
    'username': decoded.username,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

AdminSchema.statics.findByCredentials = function (username, password) {
  let admin = this

  return admin.findOne({username}).then((admin) => {
    if(!admin) return Promise.reject()

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, admin.password, (err, res) => {
        if (res) resolve(admin)
        else reject()
      })
    })
  })
}

AdminSchema.pre('save', function (next) {
  let admin = this

  if (admin.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err)
      bcrypt.hash(admin.password, salt, (err, hash) => {
        if (err) return next(err)
        admin.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

let Admin = mongoose.model('Admin', AdminSchema)

module.exports = {Admin};