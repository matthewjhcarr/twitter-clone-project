import React, { useState } from 'react'
import PropTypes from 'prop-types'
import TextareaAutosize from 'react-textarea-autosize'
import { connect } from 'react-redux'
import { createProfile } from '../../actions/profile'
import { withRouter } from 'react-router'

const CreateProfile = ({ createProfile, history }) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    youtube: '',
    facebook: '',
    linkedin: '',
    instagram: ''
  })

  const [displaySocialInputs, toggleSocialInputs] = useState(false)

  const {
    name,
    bio,
    location,
    website,
    youtube,
    facebook,
    linkedin,
    instagram
  } = formData

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    createProfile(formData, history)
  }

  return (
    <>
      <h1 className='large text-primary'>
        <i className='fas fa-kiwi-bird'></i>
      </h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Create your profile
      </p>
      <form className='form' onSubmit={onSubmit}>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={name}
            onChange={onChange}
            className='bg-dark'
          />
        </div>
        <div className='form-group'>
          <TextareaAutosize
            name='bio'
            id='bio'
            minRows='1'
            placeholder='Bio'
            value={bio}
            onChange={onChange}
            className='bg-dark form-textarea'
          />
        </div>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Location'
            name='location'
            value={location}
            onChange={onChange}
            className='bg-dark'
          />
        </div>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Website'
            name='website'
            value={website}
            onChange={onChange}
            className='bg-dark'
          />
        </div>

        <div className='my-2'>
          <button
            onClick={() => toggleSocialInputs(!displaySocialInputs)}
            type='button'
            className='btn btn-light'
          >
            Add Social Network Links
          </button>
          <span>Optional</span>
        </div>

        {displaySocialInputs && (
          <>
            <div className='form-group social-input'>
              <i className='fab fa-facebook fa-2x'></i>
              <input
                type='text'
                placeholder='Facebook URL'
                name='facebook'
                value={facebook}
                onChange={onChange}
              />
            </div>

            <div className='form-group social-input'>
              <i className='fab fa-youtube fa-2x'></i>
              <input
                type='text'
                placeholder='YouTube URL'
                name='youtube'
                value={youtube}
                onChange={onChange}
              />
            </div>

            <div className='form-group social-input'>
              <i className='fab fa-linkedin fa-2x'></i>
              <input
                type='text'
                placeholder='Linkedin URL'
                name='linkedin'
                value={linkedin}
                onChange={onChange}
              />
            </div>

            <div className='form-group social-input'>
              <i className='fab fa-instagram fa-2x'></i>
              <input
                type='text'
                placeholder='Instagram URL'
                name='instagram'
                value={instagram}
                onChange={onChange}
              />
            </div>
          </>
        )}

        <input
          type='submit'
          value='Create profile'
          className='btn btn-primary my-1'
        />
      </form>
    </>
  )
}

CreateProfile.propTypes = {
  createProfile: PropTypes.func.isRequired
}

// CreateProfile is wrapped by withRouter() to allow us to pass in a history object and use it from the action
export default connect(null, { createProfile })(withRouter(CreateProfile))
