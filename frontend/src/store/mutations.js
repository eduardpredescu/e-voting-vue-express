import * as types from './mutation-types'

export const mutations = {
  [types.LOG_IN] (state, payload) {
    state.user = payload
  },
  [types.REGISTER] (state, payload) {
    state.user = payload.user
    state.voter = payload.voter
  },
  [types.GET_VOTER] (state, payload) {
    state.voter = payload
  },
  [types.POST_VOTE] (state, payload) {
    state.voter.events.push(...payload)
  },
  [types.UPDATE_VOTER] (state, payload) {
    state.voter = payload
  }
}