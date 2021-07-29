import React, { useEffect } from 'react'
import ProfileItem from './ProfileItem'
import PropTypes from 'prop-types'
import Spinner from '../layout/Spinner'
import { connect } from 'react-redux'
import { getProfiles } from '../../actions/profile'

const Profiles = ({ getProfiles, profile: { profiles, loading } }) => {
  useEffect(() => {
    getProfiles()
  }, [getProfiles])

  return loading ? (
    <Spinner />
  ) : (
    <>
      <h1 className='large text-primary'>
        <i className='fas fa-users' /> Profiles
      </h1>
      <p className='lead'>
        Welcome to the profile index! Here you can find every person&apos;s
        profile, for some reason. Kind of like the Yellow Pages
      </p>
      <div className='profiles'>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <ProfileItem key={profile._id} profile={profile} />
          ))
        ) : (
          <h4>No profiles found...</h4>
        )}
      </div>
    </>
  )
}

Profiles.propTypes = {
  getProfiles: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    profiles: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  loading: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => ({
  profile: state.profile
})

export default connect(mapStateToProps, { getProfiles })(Profiles)
