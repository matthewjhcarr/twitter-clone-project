import {
  CLEAR_PROFILE,
  GET_PROFILE,
  GET_PROFILES,
  PROFILE_ERROR
} from '../actions/types'

const initialState = {
  profile: null,
  profiles: [],
  repos: [],
  loading: true,
  error: {}
}

export default function profile (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        loading: false
      }
    case GET_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false
      }
    case GET_PROFILES:
      return {
        ...state,
        profiles: payload,
        loading: false
      }
    case PROFILE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      }
    default:
      return state
  }
}
