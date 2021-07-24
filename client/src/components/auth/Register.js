import React, { Fragment, useState } from 'react'
import { NavLink } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: ''
  })

  // Destructure formData
  const { email, password, password2 } = formData

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    if (password !== password2) {
      console.log('Passwords do not match')
    } else {
      console.log('success')
    }
  }

  return (
    <Fragment>
      <i className="large text-primary fas fa-kiwi-bird"></i>
      <p className="lead">
        <i className="fas fa-user"></i>
        {' Create an account'}
      </p>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
          <small className="form-text">
            {
              'This site uses Gravatar, so if you want a profile image, use a Gravatar email'
            }
          </small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            minLength="6"
            value={password2}
            onChange={onChange}
            required
          />
        </div>
        <input type="submit" value="Register" className="btn btn-primary" />
      </form>
      <p className="my-1">
        {'Already have an account? '}
        <NavLink to="/login">{'Sign In'}</NavLink>
      </p>
    </Fragment>
  )
}

export default Register
