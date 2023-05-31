const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Set the views with a relative path (haven't yet found a better way of doing this yet)
const viewsFolder = __dirname 
/* const currentFolder = './current' */

// Route index page
/* router.get('/', function (req, res) {
  res.render(viewsFolder + 'index')
}) */

// Route multiple-search
/*  router.get('./views/current/multiple-search/', function (req, res) {
    console.log('test')
  })  */

// Route multiple-search working
router.get('/current/multiple-search/multiple-search-index', function (req, res) {
    console.log()
    res.render(viewsFolder + '/multiple-search/multiple-search-index')
  })


module.exports = router


