const {Voter} = require('./../models/voter')
const {Admin} = require('./../models/admin')

const authenticate = (req, res, next) => {
  let token = req.header('x-auth')

  Voter.findByToken(token).then((item) => {
    if (!item) return Promise.reject()

      req.voter = item
      req.token = token
      next()
    }).catch((e) => {
      res.status(401).send()
    })
}

module.exports = {authenticate}