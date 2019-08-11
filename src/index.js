import React from 'react'
import ReactDOM from 'react-dom'

import LoginFormContainer from './components/LoginFormContainer.jsx'

const App = () => {
  return (
    <div>
      <h1>Three Stone Hearth</h1>
      <h2>retail inventory manager</h2>
      <LoginFormContainer />
    </div>
  )
}

ReactDOM.render(<App />, document.querySelector('#root'))
