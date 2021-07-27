import React from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { deleteAccount } from '../../actions/profile'

const ProfileTop = ({
  deleteAccount,
  profile: {
    name,
    bio,
    location,
    website,
    social,
    user: { _id, username, avatar, date }
  },
  auth,
  history
}) => {
  return (
    <div className='profile-top p-2'>
      <img src={avatar} alt='' className='round-img' />
      {auth.isAuthenticated && !auth.loading && auth.user._id === _id && (
        <ul>
          <li>
            <Link to='/edit-profile' className='btn btn-primary'>
              Edit Profile
            </Link>
          </li>
          <li>
            <button
              className='btn btn-danger'
              onClick={() => deleteAccount(history)}
            >
              <i className='fas fa-user-minus'></i> Delete My Account
            </button>
          </li>
        </ul>
      )}

      <div className='basic-details'>
        <p className='name'>{name}</p>
        <p className='username'>@{username}</p>
        <p className='bio'>{bio}</p>
      </div>
      <div className='details my-1'>
        <span className='location'>
          <i className='fas fa-map-marker-alt'></i> {location}
        </span>
        {website && (
          <span>
            <i className='fas fa-link'></i> <Link to={website}>{website}</Link>
          </span>
        )}
        <span>
          <i className='far fa-calendar-alt'></i> Joined {date}
        </span>
      </div>
      <div className='socials'>
        {social && social.youtube && (
          <a href={social.youtube} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-youtube fa-2x'></i>
          </a>
        )}
        {social && social.facebook && (
          <a href={social.facebook} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-facebook fa-2x'></i>
          </a>
        )}
        {social && social.linkedin && (
          <a href={social.linkedin} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-linkedin fa-2x'></i>
          </a>
        )}
        {social && social.instagram && (
          <a href={social.instagram} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-instagram fa-2x'></i>
          </a>
        )}
      </div>
      <div className='stats'>
        <ul>
          <li>
            <a href='#!'>
              <strong>69</strong> Following
            </a>
          </li>
          <li>
            <a href='#!'>
              <strong>420</strong> Followers
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

ProfileTop.propTypes = {
  deleteAccount: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, { deleteAccount })(
  withRouter(ProfileTop)
)
