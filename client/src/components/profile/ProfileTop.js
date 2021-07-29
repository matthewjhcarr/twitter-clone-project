import { Link, NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import React from 'react'
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
    user: { _id: userId, username, avatar, date }
  },
  auth: {
    isAuthenticated = false,
    loading,
    user: { _id: authUserId }
  },
  history
}) => {
  return (
    <div className='profile-top p-2'>
      <img src={avatar} alt='' className='round-img' />
      {isAuthenticated && !loading && authUserId === userId && (
        <ul>
          <li>
            <NavLink to='/edit-profile' className='btn btn-primary'>
              Edit Profile
            </NavLink>
          </li>
          <li>
            <button
              className='btn btn-danger'
              onClick={() => deleteAccount(history)}
              type='button'
            >
              <i className='fas fa-user-minus' /> Delete My Account
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
          <i className='fas fa-map-marker-alt' /> {location}
        </span>
        {website && (
          <span>
            <i className='fas fa-link' /> <Link to={website}>{website}</Link>
          </span>
        )}
        <span>
          <i className='far fa-calendar-alt' /> Joined {date}
        </span>
      </div>
      <div className='socials'>
        {social && social.youtube && (
          <a href={social.youtube} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-youtube fa-2x' />
          </a>
        )}
        {social && social.facebook && (
          <a href={social.facebook} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-facebook fa-2x' />
          </a>
        )}
        {social && social.linkedin && (
          <a href={social.linkedin} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-linkedin fa-2x' />
          </a>
        )}
        {social && social.instagram && (
          <a href={social.instagram} target='_blank' rel='noopener noreferrer'>
            <i className='fab fa-instagram fa-2x' />
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
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    bio: PropTypes.string,
    location: PropTypes.string,
    website: PropTypes.string,
    social: PropTypes.arrayOf(PropTypes.string),
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired
    })
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, { deleteAccount })(
  withRouter(ProfileTop)
)
