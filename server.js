const express = require('express')
const next = require('next')
const cors = require('cors')
const bodyParser = require("body-parser");
const APIRouters = require('./api/router')
const AuthRouters = require('./api/router/auth')
const DashboardRouters = require('./api/router/dashboard')
const EventRouters = require('./api/router/event')

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  server.use(cors())
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(express.static('./public'))
  server.use('/api', APIRouters)
  server.use('/api/auth', AuthRouters)
  server.use('/api/event',EventRouters)
  server.use('/api/dashboard',DashboardRouters)

  server.get('/a', (req, res) => {
    return app.render(req, res, '/a', req.query)
  })

  server.get('/b', (req, res) => {
    return app.render(req, res, '/b', req.query)
  })


  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
