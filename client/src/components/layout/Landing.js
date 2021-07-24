import { NavLink } from 'react-router-dom'
import React from 'react'

const Landing = () => (
  <section className='landing'>
    <div className='dark-overlay'>
      <div className='landing-inner'>
        <h1 className='x-large'>{'Join the conversation'}</h1>
        <p className='lead'>{'Sign up today.'}</p>
        <div className='buttons'>
          {/* skipcq: JS-0394 */}
          <NavLink to='/register' className='btn btn-primary'>
            {'Sign Up'}
          </NavLink>
          {/* skipcq: JS-0394 */}
          <NavLink to='/login' className='btn btn-dark'>
            {'Login'}
          </NavLink>
        </div>
      </div>
    </div>
  </section>
)

export default Landing
