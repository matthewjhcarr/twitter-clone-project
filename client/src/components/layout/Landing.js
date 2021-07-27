import { NavLink, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

const Landing = ({ isAuthenticated = false }) => {
  if (isAuthenticated) {
    return <Redirect to='/home' />
  }

  return (
    <section className='landing'>
      <div className='dark-overlay'>
        <div className='landing-inner'>
          <h1 className='x-large'>Join the conversation</h1>
          <p className='lead'>Sign up today.</p>
          <div className='buttons'>
            {/* skipcq: JS-0394 */}
            <NavLink to='/register' className='btn btn-primary'>
              Sign Up
            </NavLink>
            {/* skipcq: JS-0394 */}
            <NavLink to='/login' className='btn btn-dark'>
              Login
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  )
}

Landing.propTypes = {
  isAuthenticated: PropTypes.bool
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated
})

export default connect(mapStateToProps)(Landing)
