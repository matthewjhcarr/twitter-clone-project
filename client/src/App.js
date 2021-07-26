import './App.css'
import React, { useEffect } from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import Alert from './components/layout/Alert'
import Footer from './components/layout/Footer'
import Home from './components/layout/Home'
import Landing from './components/layout/Landing'
import Login from './components/auth/Login'
import Navbar from './components/layout/Navbar'
import { Provider } from 'react-redux'
import Register from './components/auth/Register'
import { loadUser } from './actions/auth'
import setAuthToken from './utils/setAuthToken'
import store from './store'

// If a token exists in local storage, add it to the header of every request
if (localStorage.token) {
  setAuthToken(localStorage.token)
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])

  return (
    <Provider store={store}>
      <Router>
        <>
          <Navbar />
          <Route exact path='/' component={Landing} />
          <section className='container'>
            <Alert />
            <Switch>
              <Route exact path='/register' component={Register} />
              <Route exact path='/login' component={Login} />
              <Route exact path='/home' component={Home} />
            </Switch>
          </section>
          <Footer />
        </>
      </Router>
    </Provider>
  )
}

export default App
