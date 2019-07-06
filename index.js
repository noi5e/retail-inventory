require('dotenv').config()
// const axios = require('axios')
// const cheerio = require('cheerio')
// const fs = require('fs')
// const async = require('async')

const puppeteer = require('puppeteer')

async function loginToAdminAccount() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://admin.threestonehearth.com/login')
  await page.type('#Email', process.env['THREESTONE_HEARTH_ADMIN_EMAIL'])
  await page.type('#Password', process.env['THREESTONE_HEARTH_ADMIN_PASSWORD'])

  await page.screenshot({ path: './screenshots/screenshot.png'  })

  browser.close()

  // await page.click('[class="button-1 login-button"]')
  // await page.waitForNavigation()
  // await page.screenshot({ path: 'screenshots' })
  // browser.close()
}

loginToAdminAccount()

// (async () => {
//   const browser = await puppeteer.launch()
//   const page = await browser.newPage()
//   await page.goto('https://admin.threestonehearth.com/login')
//   await page.type('#Email', process.env['THREESTONE_HEARTH_ADMIN_EMAIL'])
//   await page.type('#Password', process.env['THREESTONE_HEARTH_ADMIN_PASSWORD'])
//   await page.click('[class="login-button"]')
//   await page.waitForNavigation()
//   await page.screenshot({ path: './screenshots' })
//   browser.close()
// })();


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

// async.series([
//   (callback) => {
//     axios.post('https://admin.threestonehearth.com/login', {
//       Email: process.env['THREESTONE_HEARTH_ADMIN_EMAIL'],
//       Password: process.env['THREESTONE_HEARTH_ADMIN_PASSWORD']
//     })
//       .then((response) => {
//         if (response.status === 200) {
//           callback(null, 'Login was successful.')
//         }
//       })
//       .catch((error) => {
//         // write error handling for wrong e-mail or password here

//         callback(error, null)
//       })
//   },
//   (callback) => {
//     axios.get('https://admin.threestonehearth.com/Admin/Product/BulkEdit')
//       .then((response) => {
//         if (response.status === 200) {
//           const html = response.data
//           console.log(html)
//           callback(null, html)
//         }
//       })
//       .catch((error) => {
//         callback(error, null)
//       })
//   }
// ], (error, results) => {
//   console.log(results)
// })

  // WEDNESDAY FLOW
  // clicking on the yellow 'ADMINISTRATION' banner after logging in: https://admin.threestonehearth.com/admin/customer
  // Catalog -> Products -> Product Inventory: https://admin.threestonehearth.com/Admin/Product/BulkEdit
  // The relevant menu will be selected under "Weekly Menu" 