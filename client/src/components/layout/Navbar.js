import { Link, NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { logout } from '../../actions/auth'

const Navbar = ({
  auth: { isAuthenticated = false, loading = true, user },
  logout
}) => {
  const authLinks = (
    <>
      <li>
        <Link to='/home'>
          <i className='fas fa-home' /> Home
        </Link>
      </li>
      {user && (
        <li>
          <Link to={`/profile/${user._id}`}>
            <i className='fas fa-user' /> Profile
          </Link>
        </li>
      )}
      <li>
        <Link to='/' onClick={logout}>
          <i className='fas fa-sign-out-alt' /> Logout
        </Link>
      </li>
    </>
  )

  const guestLinks = (
    <>
      <li>
        <NavLink to='/login' className='btn btn-primary'>
          Login
        </NavLink>
      </li>
      <li>
        <NavLink to='/register' className='btn btn-dark'>
          Sign Up
        </NavLink>
      </li>
    </>
  )

  return (
    <nav className='navbar'>
      <ul>
        <li>
          <i className='fas fa-kiwi-bird' />
          {' TwitterClone'}
        </li>
        {!loading && isAuthenticated ? authLinks : guestLinks}
      </ul>
    </nav>
  )
}

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    loading: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      password: PropTypes.string,
      avatar: PropTypes.string,
      date: PropTypes.string.isRequired
    })
  }).isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, { logout })(Navbar)
