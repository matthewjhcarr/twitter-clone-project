import { Redirect, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

// A regular route that uses a render prop to see if the user is loaded and not authenticated, in which case they get redirected to the login page
const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated = false, loading = true },
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      (!isAuthenticated && !loading ? (
        <Redirect to='/login' />
      ) : (
        <Component {...props} />
      ))}
  />
)

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired
  }).isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps)(PrivateRoute)
