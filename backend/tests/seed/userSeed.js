const {ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')

const {User} = require('./../../models/user')

const userOneId = new ObjectID()
const usernameOne = 'userOne'
const userTwoId = new ObjectID()
const usernameTwo = 'userTwo'

const users = [{
  _id: userOneId,
  username: usernameOne,
  password: '1234567',
  is_admin: true,
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userOneId, username: usernameOne}, process.env.JWT_SECRET).toString()
  }]
},{
  _id: userTwoId,
  username: usernameTwo,
  password: '1234567',
  is_admin: false,
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, username: usernameTwo}, process.env.JWT_SECRET).toString()
  }]
}]


const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save()
    let userTwo = new User(users[1]).save()

    return Promise.all([userOne, userTwo])
  }).then(() => done())
}

module.exports = {users, populateUsers}
