import { REMOVE_ALERT, SET_ALERT } from '../actions/types'

const initialState = []

export default function alert (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    // adds whatever is in payload to the states
    case SET_ALERT:
      return [...state, payload]
    // filters out any alerts that match the id of those in the payload (removes alerts)
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload)
    // by default, returns the current state
    default:
      return state
  }
}
