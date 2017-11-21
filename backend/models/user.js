const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
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
  is_admin: {
    type: Boolean,
    default: false
  }
})

UserSchema.methods.toJSON = function () {
  let User = this
  let UserObject = User.toObject()

  return _.pick(UserObject, ['_id', 'username', 'is_admin'])
}

UserSchema.methods.generateAuthToken = function () {
  let user = this
  let access = 'auth'
  let token = jwt.sign({_id: user._id.toHexString(), username: user.username, access}, process.env.JWT_SECRET).toString()

  user.tokens.push({
    access,
    token
  })

  return user.save().then(() => {
    return token
  })
}

UserSchema.methods.removeToken = function (token) {
  let User = this

  return User.update({
    $pull: {
      tokens: {token}
    }
  })
}

UserSchema.statics.findByToken = function (token) {
  let User = this
  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    return Promise.reject()
  }

  return User.findOne({
    '_id': decoded._id,
    'username': decoded.username,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.statics.findByCredentials = function (username, password) {
  let User = this

  return User.findOne({username}).then((User) => {
    if(!User) return Promise.reject()

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, User.password, (err, res) => {
        if (res) resolve(User)
        else reject()
      })
    })
  })
}

UserSchema.pre('save', function (next) {
  let User = this

  if (User.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next(err)
      bcrypt.hash(User.password, salt, (err, hash) => {
        if (err) return next(err)
        User.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

let User = mongoose.model('User', UserSchema)

module.exports = {User}