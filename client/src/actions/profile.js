import {
  ACCOUNT_DELETED,
  CLEAR_PROFILE,
  GET_PROFILE,
  GET_PROFILES,
  PROFILE_ERROR
} from './types'

import axios from 'axios'
import { setAlert } from './alert'

// Get current user's profile
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/profile/me')

    dispatch({
      type: GET_PROFILE,
      payload: res.data
    })
  } catch (err) {
    dispatch({ type: CLEAR_PROFILE })

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

export const getProfileById = (userId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/profile/user/${userId}`)

    dispatch({
      type: GET_PROFILE,
      payload: res.data
    })
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

export const getProfiles = () => async (dispatch) => {
  dispatch({ type: CLEAR_PROFILE })

  try {
    const res = await axios.get('/api/profile')

    dispatch({
      type: GET_PROFILES,
      payload: res.data
    })
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

export const createProfile =
  (formData, history, edit = false) =>
    async (dispatch) => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        }

        const res = await axios.post('/api/profile', formData, config)

        if (edit) {
          history.goBack()
        }

        history.push('/home')

        dispatch({
          type: GET_PROFILE,
          payload: res.data
        })

        dispatch(
          setAlert(edit ? 'Profile updated' : 'Profile created', 'success')
        )
      } catch (err) {
        const {
          response: {
            data: { errors },
            status,
            statusText
          }
        } = err

        if (errors) {
          errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
          type: PROFILE_ERROR,
          payload: { msg: statusText, status }
        })
      }
    }

// Delete account & profile
export const deleteAccount = (history) => async (dispatch) => {
  if (window.confirm('Are you sure? This can not be undone.')) {
    try {
      await axios.delete('/api/users')

      history.push('/home')

      dispatch({ type: CLEAR_PROFILE })
      dispatch({ type: ACCOUNT_DELETED })

      dispatch(setAlert('Your account has been permanently deleted'))
    } catch (err) {
      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      })
    }
  }
}
