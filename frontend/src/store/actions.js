import * as types from './mutation-types'
import {noTokenAPI} from '../api'

export const Register = ({commit}, payload) => {
  noTokenAPI.post('/voters/', {user: payload.user, voter: payload.voter}).then((response) => {
    localStorage.setItem('evotetoken', response.headers['x-auth'])
    commit(types.REGISTER, response)
  })
}

export const Login = ({commit}, payload) => {
  noTokenAPI.post('/voters/login/', {username: payload.username, password: payload.password}).then((response) => {
    localStorage.setItem('evotetoken', response.headers['x-auth'])
    commit(types.LOG_IN, response.data)
  })
}
