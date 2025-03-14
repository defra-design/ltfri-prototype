//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const fs = require('fs')
const path = require('path')

// Add your routes here

// Route index page
/* router.get('/', function (req, res) {
  res.render('./index')
}) */

// Route for version 3

const authESRI = require('./esri-auth')
const authOS = require('./os-auth')

router.use((req, res, next) => {
    res.locals.env = process.env
    next()
})

router.get('/esri-token', async (req, res, next) => {
    const response = await authESRI({
        clientId: process.env.ESRI_CLIENT_ID,
        clientSecret: process.env.ESRI_CLIENT_SECRET
    })
    res.json({ token: response })
})

router.get('/os-token', async (req, res, next) => {
    const response = await authOS({
        clientId: process.env.OS_CLIENT_ID,
        clientSecret: process.env.OS_CLIENT_SECRET
    })
    res.send(response)
})

router.get([
    '/styles/vts-tile.json',
    '/styles/open-tile.json',
    '/styles/OS_VTS_27700_Outdoor.json',
    '/styles/OS_VTS_27700_Open_Outdoor.json',
    '/styles/OS_VTS_27700_Dark.json',
    '/styles/OS_VTS_27700_Open_Dark.json',
    '/styles/polygon-default.json',
    '/styles/polygon-dark.json'
  ], async (req, res, next) => {
    fs.readFile(path.resolve(__dirname, req.originalUrl.substring(1).split('?')[0]), (err, result) => {
      if (err) throw err
      const jsonData = JSON.parse(result)
      res.setHeader('Content-Type', 'application/json')
      res.json(jsonData)
    })
  })
  
module.exports = router










// GET SPRINT NAME - useful for relative templates
/*  router.use('/', (req, res, next) => {
  res.locals.currentURL = req.originalUrl; //current screen
  res.locals.prevURL = req.get('Referrer'); // previous screen
console.log('previous page is: ' + res.locals.prevURL + " and current page is " + req.url + " " + res.locals.currentURL );
  next();
}); */
 