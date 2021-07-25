import { REMOVE_ALERT, SET_ALERT } from './types'
import { v4 as uuid } from 'uuid'

const TIMEOUT = 5000

export const setAlert =
  (msg, alertType, timeout = TIMEOUT) =>
    (dispatch) => {
    // Create alert id
      const id = uuid()

      // Send alert with message, alert type (colour), and id
      dispatch({
        type: SET_ALERT,
        payload: { msg, alertType, id }
      })

      // Dismiss alert after 5 seconds
      setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout)
    }
