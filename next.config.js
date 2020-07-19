const withSass = require('@zeit/next-sass')

const config = {
  APP_NAME: process.env.APP_NAME,
  API_URL: process.env.API_URL
}

module.exports = withSass({
  /* config options here */
  env: config,
  publicRuntimeConfig: config
})