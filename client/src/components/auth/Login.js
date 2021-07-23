import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Destructure formData
  const { email, password } = formData

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    console.log('success')
  }

  return (
    <Fragment>
      <section className="login-container">
        <h1 className="large text-primary">
          <i className="fas fa-kiwi-bird"></i>
        </h1>
        <p className="lead">
          <i className="fas fa-user"></i> Sign In to your account
        </p>
        <form onSubmit={(e) => onSubmit(e)} className="form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              name="email"
              value={email}
              onChange={(e) => onChange(e)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              minLength="6"
              value={password}
              onChange={(e) => onChange(e)}
              required
            />
          </div>
          <input type="submit" value="Login" className="btn btn-primary" />
        </form>
        <p className="my-1">
          <Link to="/register">Sign up for TwitterClone</Link>
        </p>
      </section>
    </Fragment>
  )
}

export default Login
