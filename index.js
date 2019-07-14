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




  let retailProductIDList = []

  for (let i = 0; i < completedRetailProducts.length; i++) {
    retailProductIDList.push({ name: completedRetailProducts[i]['Exact Name: NOP'] })
  }

  // helper function to escape product names that have single quotes in their names:
  const escapeXPathString = (string) => {
    const splitQuotes = string.replace(/'/g, `', "'", '`)
    return `concat('${splitQuotes}', '')`
  }

  for (let i = 0; i < retailProductIDList.length; i++) {
    try {
      // const elementHandles = await page.$x(`//tr[td[contains(text(), ${escapeXPathString(retailProductIDList[i].name)})]]`)
      const elementHandles = await page.$x(`//tr[td/text()=${escapeXPathString(retailProductIDList[i].name)}]`)
      retailProductIDList[i].elementHandle = elementHandles[1]
      let dataUID = await page.evaluate(element => element.getAttribute('data-uid'), elementHandles[1])  
      retailProductIDList[i].dataUID = dataUID
    } catch(error) {
      console.error('Error with this product: ' + retailProductIDList[i].name)
    }
  }

  const retrieveIDfromString = (string) => {
    return parseInt(string.match(/\d+/)[0])
  }

  for (let i = 0; i < retailProductIDList.length; i++) {

    try {
      let otherElementHandles = await page.$x(`//tr[@data-uid="${retailProductIDList[i].dataUID}"]`)
      let innerText = await otherElementHandles[0].$$eval('td', nodes => nodes.map((node) => node.innerHTML))

      if (!innerText[10]) {
        let innerText = await otherElementHandles[1].$$eval('td', nodes => nodes.map((node) => node.innerHTML))

        retailProductIDList[i].id = retrieveIDfromString(innerText[7])

        console.log(retailProductIDList[i].name)
      } else {
        retailProductIDList[i].id = retrieveIDfromString(innerText[10]
        )      }
    } catch(error) {
      console.error('Error with this product: ' + retailProductIDList[i].name)
    }
  }

  let ids = []

  // these products get overwritten:
  // Book: Full Moon Feast
  // By Nieves "C" Perfect Skin Large 8 oz refill
  // By Nieves Face Fix Travel Size
  // Miss Bee Haven Beeswax Wrap with Button
  // Rosita Extra-Virgin Cod Liver Oil Capsules
  // Yume Boshi Umeboshi Salty Pickles 4.5 oz

  for (let i = 0; i < retailProductIDList.length; i++) {
    // if (!retailProductIDList[i].id) {
    //   console.log(retailProductIDList[i].name + ': ' + retailProductIDList[i].id)
    // }

    if (ids.indexOf(retailProductIDList[i].id) > -1) {
      console.log(retailProductIDList[i].name)
    }

    ids.push(retailProductIDList[i].id)

    console.log(retailProductIDList[i].name + ': ' + retailProductIDList[i].id)
  }





  // // iterates over CSV of retail products, to filter out only Wednesday perishables:
  // let wednesdayPerishables = completedRetailProducts.filter((product) => {
  //   return product['Weekly Recurring Order'] === "TRUE";
  // }).map((product) => {
  //   return { name: product['Exact Name: NOP'] }
  // })

  // // helper function to escape product names that have single quotes in their names:
  // const escapeXPathString = (string) => {
  //   const splitQuotes = string.replace(/'/g, `', "'", '`)
  //   return `concat('${splitQuotes}', '')`
  // }

  // // iterates over the names of Wednesday perishables, finds the <tr> tags that contain them via XPath, and saves the element handles:
  // for (let i = 0; i < wednesdayPerishables.length; i++) {
  //   const elementHandles = await page.$x(`//tr[td[contains(text(), ${escapeXPathString(wednesdayPerishables[i].name)})]]`)
  //   wednesdayPerishables[i].elementHandle = elementHandles[1]

  //   let dataUID = await page.evaluate(element => element.getAttribute('data-uid'), elementHandles[1])
  //   wednesdayPerishables[i].dataUID = dataUID
  // }

  // // iterates over element handles, and finds the corresponding, separate <tr> that has the sales numbers:
  // for (let i = 0; i < wednesdayPerishables.length; i++) {
  //   let otherElementHandles = await page.$x(`//tr[@data-uid="${wednesdayPerishables[i].dataUID}"]`)

  //   let innerText = await otherElementHandles[0].$$eval('td', nodes => nodes.map(node => node.innerText))

  //   wednesdayPerishables[i].inventory = parseInt(innerText[5])
  //   wednesdayPerishables[i].toSell = parseInt(innerText[7])
  //   wednesdayPerishables[i].sold = parseInt(innerText[8])
  //   wednesdayPerishables[i].remainingToSell = parseInt(innerText[9])
  // }

  // console.log(wednesdayPerishables)

  // await page.screenshot({ path: './screenshots/' + new Date().getTime() + '.png' })
  browser.close()
}

loginToAdminAccount()