import React from 'react'
import spinner from '../../img/Spinner.gif'

const Spinner = () => (
  <img
    src={spinner}
    style={{ width: '200px', margin: 'auto', display: 'block' }}
    alt='Loading...'
  />
)

export default Spinner
