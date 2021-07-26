import './App.css'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import Alert from './components/layout/Alert'
import Footer from './components/layout/Footer'
import Landing from './components/layout/Landing'
import Login from './components/auth/Login'
import Navbar from './components/layout/Navbar'
import { Provider } from 'react-redux'
import React from 'react'
import Register from './components/auth/Register'
import { loadUser } from './actions/auth'
import setAuthToken from './utils/setAuthToken'
import store from './store'

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
            </Switch>
          </section>
          <Footer />
        </>
      </Router>
    </Provider>
  )
}

export default App
