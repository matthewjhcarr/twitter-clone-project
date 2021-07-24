import './App.css'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import React, { Fragment } from 'react'
import Footer from './components/layout/Footer'
import Landing from './components/layout/Landing'
import Login from './components/auth/Login'
import Navbar from './components/layout/Navbar'
import Register from './components/auth/Register'

const App = () => (
  <Router>
    <>
      <Navbar />
      <Route exact path='/' component={Landing} />
      <section className='container'>
        <Switch>
          <Route exact path='/register' component={Register} />
          <Route exact path='/login' component={Login} />
        </Switch>
      </section>
      <Footer />
    </>
  </Router>
)

export default App
