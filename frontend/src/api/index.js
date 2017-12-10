import axios from 'axios'

const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api/' : ''

export const noTokenAPI = axios.create({
  baseURL: API_URL
})

export const TokenAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'x-auth': localStorage.getItem('evotetoken')
  }
})
