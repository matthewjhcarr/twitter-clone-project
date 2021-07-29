import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import React from 'react'

const ProfileItem = ({
  profile: {
    user: { _id, username, avatar },
    name,
    bio,
    location
  }
}) => {
  return (
    <div className='profile'>
      <img src={avatar} alt='' className='round-img' />

      <div>
        <h2>{name}</h2>
        <p>@{username}</p>
        <p>{bio}</p>
        <p>{location}</p>
        <NavLink to={`/profile/${_id}`} className='btn btn-primary'>
          View profile
        </NavLink>
      </div>
    </div>
  )
}

ProfileItem.propTypes = {
  profile: PropTypes.shape({
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired
    }).isRequired,
    name: PropTypes.string.isRequired,
    bio: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired
  }).isRequired
}

export default ProfileItem
