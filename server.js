const express = require('express')
const next = require('next')
var cors = require('cors')
const APIRouters = require('./api/router')
const AuthRouters = require('./api/router/auth')

const port = parseInt(process.env.PORT, 10) || 8080
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// app.prepare().then(() => {
  const server = express()
  server.use(cors())
  server.use(express.json());
  server.use(express.urlencoded({ extended: false }));
  server.use(express.static('./public'))
  server.use('/api', APIRouters)
  server.use('/api/auth', AuthRouters)

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
// })
