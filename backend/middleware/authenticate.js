var {Voter} = require('./../models/voter');


var authenticate = (req, res, next) => {
  let token = req.header('x-auth');

    Voter.findByToken(token).then((voter) => {
      if (!voter) return Promise.reject()

      req.voter = voter
      req.token = token
      next()
    }).catch((e) => {
      res.status(401).send()
    })
}

module.exports = {authenticate}