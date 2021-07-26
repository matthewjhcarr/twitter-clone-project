import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { logout } from '../../actions/auth'

const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
  const authLinks = (
    <>
      <li>
        <Link to='/home'>
          <i className='fas fa-home' /> Home
        </Link>
      </li>
      <li>
        <Link to='#!' onClick={logout}>
          <i className='fas fa-sign-out-alt' /> Logout
        </Link>
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
        {!loading && <>{isAuthenticated && authLinks}</>}
      </ul>
    </nav>
  )
}

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, { logout })(Navbar)
