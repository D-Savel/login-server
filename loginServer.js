const fsPromises = require('fs/promises')
const cors = require('cors')
const express = require('express')

const LOG_FILE = 'logs/access-log.txt'

const IP_LOOPBACK = 'localhost'
const IP_LOCAL = '192.168.1.29' // my local ip on my network
const PORT = 3333

// timer middleware
const timer = (req, res, next) => {
  const date = new Date()
  req.requestDate = date.toUTCString()
  next()
}

// logger middleware
const logger = async (req, res, next) => {
  try {
    const log = `${req.requestDate} ${req.method} "${req.originalUrl}" from ${req.ip} ${req.headers['user-agent']}\n`
    await fsPromises.appendFile(LOG_FILE, log, 'utf-8')
  } catch (e) {
    console.error(`Error: can't write in ${LOG_FILE}`)
  } finally {
    next()
  }
}

// shower middleware
const shower = async (req, res, next) => {
  const log = `${req.requestDate} ${req.method} "${req.originalUrl}" from ${req.ip} ${req.headers['user-agent']}`
  console.log(log)
  next()
}
// Middleware for checking if user exists
const userChecker = async (req, res, next) => {
  const json = await fsPromises.readFile('./db_user', 'utf8')
  const user = JSON.parse(json)
  const username = req.body.username
  if (user.hasOwnProperty(username)) {
    next()
  } else {
    res.status(401).send('Username or password invalid.')
  }
}

// Middleware for checking if password is correct
const passwordChecker = async (req, res, next) => {
  const json = await fsPromises.readFile('./db_user', 'utf8')
  const user = JSON.parse(json)
  const username = req.body.username
  const password = req.body.password
  if (user[username] === password) {
    next()
  } else {
    res.status(401).send('Username or password invalid.')
  }
}

// Middleware for saving username & password
const register = async (req, res, next) => {
  const json = await fsPromises.readFile('./db_user', 'utf8')
  const user = JSON.parse(json)
  const username = req.body.username
  const password = req.body.password
  if (user.hasOwnProperty(username)) {
    res.status(409).send(`${username} unvalaible username`)
  } else {
    user[username] = password
    const str = JSON.stringify(user)
    await fsPromises.writeFile('./db_user', str, 'utf8')
    next()
  }
}

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false })) // to support URL-encoded bodies
app.use(express.json()) // to support JSON-encoded bodies
app.use(timer)
app.use(logger)
app.use(shower)
app.use('/login', userChecker)
app.use('/login', passwordChecker)
app.use('/register', register)



app.post('/login', (req, res) => {
  let username = req.body.username
  console.log(`user "${username}" connected from ${req.ip}`)
  res.send(`Welcome to your dashboard ${username}`)
})

app.post('/register', (req, res) => {
  let username = req.body.username
  let password = req.body.username
  res.send(`your username "${username}" have been registered with password`)
})

// start the server
app.listen(PORT, IP_LOOPBACK, () => {
  console.log(`Example app listening at http://${IP_LOOPBACK}:${PORT}`)
})