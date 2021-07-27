import alert from './alert'
import auth from './auth'
import profile from './profile'
import { combineReducers } from 'redux'

// exports all reducers
export default combineReducers({ alert, auth, profile })
