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
  await page.keyboard.press('Enter')
  await page.waitForNavigation()
  await page.goto('https://admin.threestonehearth.com/Admin/Product/BulkEdit')
  await page.waitForSelector('td[role="gridcell"]')
  await page.screenshot({ path: './screenshots/' + new Date().getTime() + '.png' })
  browser.close()
}

loginToAdminAccount()

  // WEDNESDAY FLOW
  // clicking on the yellow 'ADMINISTRATION' banner after logging in: https://admin.threestonehearth.com/admin/customer
  // Catalog -> Products -> Product Inventory: https://admin.threestonehearth.com/Admin/Product/BulkEdit
  // The relevant menu will be selected under "Weekly Menu" 