const cookieParser = require('cookie-parser')

require('dotenv').config({ path: 'variables.env' })
const createServer = require('./createServer')
const db = require('./db')

// let's go!
const server = createServer()

server.express.use(cookieParser())
// TODO use express middleware to populate users

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  details => {
    console.log(`Server is now running on ${details.port}`)
  }
)
