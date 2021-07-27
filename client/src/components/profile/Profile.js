import React, { Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Spinner from '../layout/Spinner'
import ProfileTop from './ProfileTop'
import { getProfileById } from '../../actions/profile'

const Profile = ({ getProfileById, profile: { profile, loading }, match }) => {
  useEffect(() => {
    getProfileById(match.params.id)
  }, [getProfileById, match.params.id])
  return (
    <Fragment>
      {profile === null || loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <div className='profile-grid my-1'>
            <ProfileTop profile={profile} />
          </div>
        </Fragment>
      )}
    </Fragment>
  )
}

Profile.propTypes = {
  getProfileById: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    profile: PropTypes.shape({
      user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        date: PropTypes.string.isRequired
      }).isRequired
    }),
    loading: PropTypes.bool
  }).isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth
})

export default connect(mapStateToProps, { getProfileById })(Profile)
