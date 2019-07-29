import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  input: {
    margin: theme.spacing(1)
  }
}));

class LoginForm extends React.Component {
  render() {
    const classes = useStyles();

    return (
      <Input
        placeholder="Username"
        className={classes.input}
        inputProps={{
          'aria-label': 'username'
        }}
      />
    );
  }
}

export default LoginForm;