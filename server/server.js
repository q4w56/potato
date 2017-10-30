const config = require('../config')
const debug = require('debug')('up')
const mongoose = require('mongoose')
mongoose.connect(config.mongourl, { useMongoClient: true })
mongoose.Promise = global.Promise
const api = require('./api/api')
const express = require('express')
const app = express()
const nunjucks = require('nunjucks')
nunjucks.configure('views', {express: app})
const Story = require('./models/Story')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const {auth} = require('./api/auth')
const {ClientError} = require('./utils')

app.use(compression())
app.use(cookieParser())
app.disable('x-powered-by')

app.use( (req,res,next) => {
  res.panic = function(error, status){
    console.error(error)
    error = error || ''
    status = status || 500
    res.status(status).render('error.njk', {error: 'server error', status})
  }
  res.frown = function(error, status){
    console.error(error)
    error = error || ''
    status = status || 400
    res.status(status).render('error.njk', {error, status})
  }
  next()
})


app.use('/js', express.static(__dirname + '/../dist/js'))
app.use('/css', express.static(__dirname + '/../dist/css'))

app.use('/api', api )

app.get('/debug', (req,res,next) => {
  res.sent = true
  res.send('ooo')
  next()
})

app.get('/test', (req,res) => {
  console.log('oooooooo')
  res.json('test')
})


app.get('/', (req, res) => {
  res.render('react.njk', {resources: '["/api/stories"]'})
})


app.get('/p/:id', (req, res, next) => {

  Story.collection.findOne({id: ~~req.params.id})
    .then( x => {
      if( x === null ) throw 404
      const resources = JSON.stringify([`/api/story/${req.params.id}`])
      res.render('react.njk', {resources})
    })

    .catch( e => next(e) )
})


app.get('/submit', (req, res) => {
  res.render('react.njk', {resources: JSON.stringify([])} )
})

app.get('/profile', (req, res) => {
  res.render('react.njk', {resources: JSON.stringify([])} )
})

app.get('/login', (req, res) => {
  res.render('react.njk', {resources: JSON.stringify([])} )
})

app.get('/oauth-redirect-back-google', (req,res) => {
  res.send(`
		<html><script>
			window.opener.oauthPopupCallback(window.location.hash)
			window.close()
		</script></html>
	`)
})


app.use( (err,req,res,next) => {

  if(err.constructor === ClientError){
    res.frown(err.reason, err.status)
  }

  else if( err === 404 ){
    res.status(404).render('notfound.njk')
  }
  else{
    console.error( err )
    res.panic('Unexpected server error')
  }
})

app.use( (req,res,next) => {

  res.status(404).render('notfound.njk')
})

app.listen(9090, function () {
  console.log('Server listening on http://localhost:9090')
})
