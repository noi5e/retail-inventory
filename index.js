require('dotenv').config()
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const async = require('async')

// axios.post('https://admin.threestonehearth.com/login', {
//   Email: process.env['THREESTONE_HEARTH_ADMIN_EMAIL'],
//   Password: process.env.['THREESTONE_HEARTH_ADMIN_PASSWORD']
// })
//   .then((response) => {
//     if (response.status === 200) {
//       const html = response.data
//       console.log(html)
//       const $ = cheerio.load(html)
//     }
//   })
//   .catch((error) => {
//   	console.log('Error logging in: ' + error)
//   })

async.series([
  (callback) => {
    axios.post('https://admin.threestonehearth.com/login', {
      Email: process.env['THREESTONE_HEARTH_ADMIN_EMAIL'],
      Password: process.env['THREESTONE_HEARTH_ADMIN_PASSWORD']
    })
      .then((response) => {
        if (response.status === 200) {
          callback(null, 'Login was successful.')
        }
      })
      .catch((error) => {
        // write error handling for wrong e-mail or password here

        callback(error, null)
      })
  },
  (callback) => {
    axios.get('https://admin.threestonehearth.com/Admin/Product/BulkEdit')
      .then((response) => {
        if (response.status === 200) {
          const html = response.data
          console.log(html)
          callback(null, html)
        }
      })
      .catch((error) => {
        callback(error, null)
      })
  }
], (error, results) => {
  console.log(results)
})

  // WEDNESDAY FLOW
  // clicking on the yellow 'ADMINISTRATION' banner after logging in: https://admin.threestonehearth.com/admin/customer
  // Catalog -> Products -> Product Inventory: https://admin.threestonehearth.com/Admin/Product/BulkEdit
  // The relevant menu will be selected under "Weekly Menu" 