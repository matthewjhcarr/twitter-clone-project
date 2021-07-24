import { Link } from 'react-router-dom'
import React from 'react'

const Footer = () => (
  <footer className="footer bg-dark">
    <ul className="small">
      <li>
        <Link to="#">{'About'}</Link>
      </li>
      <li>
        <Link to="#">{'Need help?'}</Link>
      </li>
      <li>
        <Link to="#">{'Blog'}</Link>
      </li>
      <li>
        <Link to="#">{'Status'}</Link>
      </li>
      <li>
        <Link to="#">{'The developer'}</Link>
      </li>
      <li>
        <Link to="#">{'Directory'}</Link>
      </li>
      <li>
        <Link to="#">{'Settings'}</Link>
      </li>
    </ul>
  </footer>
)

export default Footer
