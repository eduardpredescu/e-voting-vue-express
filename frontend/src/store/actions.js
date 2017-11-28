import axios from 'axios'
import * as types from './mutation-types'

export const Login = ({commit}, payload) => {
  axios.post('http://localhost:3000/api/voters/', {user: payload.user, voter: payload.voter}).then(() => {})
}