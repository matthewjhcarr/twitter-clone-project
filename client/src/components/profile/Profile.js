import React, { useEffect } from 'react'
import ProfileTop from './ProfileTop'
import PropTypes from 'prop-types'
import Spinner from '../layout/Spinner'
import { connect } from 'react-redux'
import { getProfileById } from '../../actions/profile'

const Profile = ({
  getProfileById,
  profile: { profile, loading },
  match: {
    params: { id }
  }
}) => {
  useEffect(() => {
    getProfileById(id)
  }, [getProfileById, id])
  return profile === null || loading ? (
    <Spinner />
  ) : (
    <div className='profile-grid my-1'>
      <ProfileTop profile={profile} />
    </div>
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

const mapStateToProps = (state) => ({
  profile: state.profile
})

export default connect(mapStateToProps, { getProfileById })(Profile)
