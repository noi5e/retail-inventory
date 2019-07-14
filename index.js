require('dotenv').config()

const csvParse = require('csv-parser')
const fs = require('fs')
const puppeteer = require('puppeteer')
const util = require('util')

async function loginToAdminAccount() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  console.log('Loading admin homepage...')
  await page.goto('https://admin.threestonehearth.com/login')
  console.log('Entering admin e-mail...')
  await page.type('#Email', process.env['THREESTONE_HEARTH_ADMIN_EMAIL'])
  console.log('Entering admin password...')
  await page.type('#Password', process.env['THREESTONE_HEARTH_ADMIN_PASSWORD'])
  console.log('Clicking enter...')
  await page.keyboard.press('Enter')
  console.log('Waiting for navigation...')
  await page.waitForNavigation()
  console.log('Going to Product Inventory page...')
  await page.goto('https://admin.threestonehearth.com/Admin/Product/BulkEdit')
  console.log('Waiting for inventory to load...')
  await page.waitForSelector('td[role="gridcell"]')

  console.log('Opening and reading CSV into parser...')
  const readStream = fs.createReadStream('./csv/online-retail-products.csv')
  const csvParsing = readStream.pipe(csvParse())

  let retailProducts = []

  const fullyParsedStream = new Promise((resolve, reject) => {
    csvParsing.on('data', (data) => retailProducts.push(data))
    csvParsing.on('end', () => resolve(retailProducts))
    readStream.on('error', reject)
  })

  let completedRetailProducts = await fullyParsedStream

  // iterates over CSV of retail products, to filter out only Wednesday perishables:
  let wednesdayPerishables = completedRetailProducts.filter((product) => {
    return product['Weekly Recurring Order'] === "TRUE";
  }).map((product) => {
    return { name: product['Exact Name: NOP'] }
  })

  // helper function to escape product names that have single quotes in their names:
  const escapeXPathString = (string) => {
    const splitQuotes = string.replace(/'/g, `', "'", '`)
    return `concat('${splitQuotes}', '')`
  }

  // iterates over the names of Wednesday perishables, finds the <tr> tags that contain them via XPath, and saves the element handles:
  for (let i = 0; i < wednesdayPerishables.length; i++) {
    const elementHandles = await page.$x(`//tr[td[contains(text(), ${escapeXPathString(wednesdayPerishables[i].name)})]]`)
    wednesdayPerishables[i].elementHandle = elementHandles[1]

    let dataUID = await page.evaluate(element => element.getAttribute('data-uid'), elementHandles[1])
    wednesdayPerishables[i].dataUID = dataUID
  }

  //  FORMAT OF EACH PRODUCT <tr>: 

  //  <tr class="k-alt" data-uid="someString" role="row">
  //    <td>$Price</td>
  //    <td>Blank Cell</td>
  //    <td>Inventory #</td>
  //    <td><img src="mystery-checkmark.gif" /></td>
  //    <td>To Sell #</td>
  //    <td><a>Sold</a></td>
  //    <td>Remaining To Sell</td>
  //    <td><a>View Product</a></td>
  //  </tr>

  // iterates over element handles, and finds the corresponding, separate <tr> that has the sales numbers:
  for (let i = 0; i < wednesdayPerishables.length; i++) {
    console.log(wednesdayPerishables[i].name + ': ' + wednesdayPerishables[i].dataUID)

    let otherElementHandles = await page.$x(`//tr[@data-uid="${wednesdayPerishables[i].dataUID}"]`)
    console.log(otherElementHandles.length)

    // let inventoryNumberHandle = await otherElementHandles[0].$x(`/td`)

    let innerText = await otherElementHandles[0].getProperty('innerText')
    let innerJSON = await innerText.jsonValue()
    console.log(innerText)


    // console.log(inventoryNumber)

    // let dataUID = await page.evaluate(element => element.getAttribute('data-uid'), otherElementHandles[1])
  }

  // async function getDataUID(product) {
  //   return await page.evaluate((product) => {
  //     product.dataUID = product.elementHandle.getAttribute('data-uid')
  //   }, product)
  // }

  // async function getIDforArray(array) {
  //   const promises = array.map(getDataUID)
  // }

  // const promises = wednesdayPerishables.map(getDataUID)
  // await Promise.all(promises)

  const elementHandles = await page.$x(`//tr[td[contains(text(), '${wednesdayPerishables[0].name}')]]`)
  const roleHandle = await elementHandles[1].getProperty('outerHTML')
  const roleJSON = await roleHandle.jsonValue()
  // console.log(roleJSON)

  let role = await page.evaluate(element => element.getAttribute('data-uid'), elementHandles[1])
  // console.log(role)

  // await page.screenshot({ path: './screenshots/' + new Date().getTime() + '.png' })
  browser.close()
}

loginToAdminAccount()