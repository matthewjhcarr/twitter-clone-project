import React, { useState } from 'react'
import { NavLink, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { login } from '../../actions/auth'
import { connect } from 'react-redux'

const Login = ({ login, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Destructure formData
  const { email, password } = formData

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    login(email, password)
  }

  if (isAuthenticated) {
    return <Redirect to='/home' />
  }

  return (
    <>
      <i className='large text-primary fas fa-kiwi-bird' />
      <p className='lead'>
        <i className='lead fas fa-user' />
        {' Sign In to your account'}
      </p>
      <form onSubmit={onSubmit} className='form'>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email address'
            name='email'
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            minLength='6'
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <input type='submit' value='Login' className='btn btn-primary' />
      </form>
      {/* skipcq: JS-0394 */}
      <NavLink to='/register' className='my-1'>
        Sign up for TwitterClone
      </NavLink>
    </>
  )
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
}

const mapStateToProps = (state) => ({
  iAuthenticated: state.auth.isAuthenticated
})

export default connect(mapStateToProps, { login })(Login)
