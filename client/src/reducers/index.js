import alert from './alert'
import auth from './auth'
import { combineReducers } from 'redux'

// exports all reducers
export default combineReducers({ alert, auth })
