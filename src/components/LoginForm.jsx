import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

function LoginForm () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    console.log('handle submit triggered')
    // if (!email || !password) return
    // console.log(email + ', ' + password)
    // setEmail('')
    // setPassword('')
  }

  const useStyles = makeStyles(theme => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap'
    },
    TextField: {
      margin: theme.spacing(1)
    }
  }))

  const classes = useStyles()

  return (
    <form className={classes.container} onSubmit={handleSubmit} noValidate>
      <TextField
        id="email"
        placeholder="NOP Email"
        className={classes.TextField}
        inputProps={{
          'aria-label': 'email'
        }}
        required
        autoFocus
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <TextField
        id="password"
        placeholder="Password"
        className={classes.TextField}
        inputProps={{
          'aria-label': 'password'
        }}
        required
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button
        type="submit"
      >
        Sign In
      </Button>
    </form>
  )
}

export default LoginForm
