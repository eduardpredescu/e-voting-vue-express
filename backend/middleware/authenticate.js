const {User} = require('./../models/user')

const authenticate = (req, res, next) => {
  let token = req.header('x-auth')

  User.findByToken(token).then((item) => {
    if (!item) return Promise.reject()

      req.user = item
      req.token = token
      next()
    }).catch((e) => {
        res.status(401).send(e)
    })
}

module.exports = {authenticate}