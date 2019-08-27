const express = require('express')
const router = new express.Router()
const passport = require('passport')
const fs = require('fs')
const path = require('path')
const url = require('url')

router.get('/login', passport.authenticate('local-login'), (request, response) => {
  
})

module.exports = router
