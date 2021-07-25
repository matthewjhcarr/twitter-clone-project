import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { register } from '../../actions/auth'
import { setAlert } from '../../actions/alert'

const Register = ({ setAlert, register }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  })

  const { username, email, password, password2 } = formData

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password !== password2) {
      setAlert('Passwords do not match', 'danger')
    } else {
      register({ username, email, password })
    }
  }

  return (
    <>
      <i className='large text-primary fas fa-kiwi-bird' />
      <p className='lead'>
        <i className='fas fa-user' />
        {' Create an account'}
      </p>
      <form className='form' onSubmit={onSubmit}>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Username'
            name='username'
            value={username}
            onChange={onChange}
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={onChange}
          />
          <small className='form-text'>
            This site uses Gravatar, so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            minLength='6'
            value={password}
            onChange={onChange}
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password2'
            minLength='6'
            value={password2}
            onChange={onChange}
          />
        </div>
        <input type='submit' value='Register' className='btn btn-primary' />
      </form>
      <p className='my-1'>
        {'Already have an account? '}
        <Link to='/login'>Sign In</Link>
      </p>
    </>
  )
}

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired
}

export default connect(null, { setAlert, register })(Register)
