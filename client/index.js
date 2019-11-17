#!/usr/bin/env node

// This is the client.

const child_process = require('child_process')
const path = require('path')
const message = require('../message')
const jsonrpc = require('../jsonrpc')

// Again, use spawn to separate Node relationship.  This could be on a remote
// machine for all we care.
const serverPath = path.resolve(__dirname, '../server/index.js')
let server

const EXIT = 'e'

const showHelp = () => console.log(
`
You can issue the following commands:

* (s)tart server - start the LSP server
* (st)op server - stop the server
* (r)estart server

* (i)nitialize
* (sh)utdoown
* (${EXIT})xit
`)

const logMessage = (label) => (message) => {
  const line = '----------------------'
  console.log(`${line}\n${label}\n${line}`)
  console.log(message)
}

const logInbound = logMessage('client <- server')
const logOutbound = logMessage('client -> server')

const sendMessage = (message) => {
  if (server) {
    server.stdin.write(message)
    logOutbound(message)
  }
}

const notify = (method, params) => {
  sendMessage(
    message.stringify(jsonrpc.notification(method, params))
  )
}

let requestId = 0

const request = (method, params) => {
  sendMessage(
    message.stringify(jsonrpc.request(method, params, requestId++))
  )
}

const startServer = () => {
  server = child_process.spawn(serverPath)
  console.log('> server started')
  server.stderr.pipe(process.stderr)
  server.stderr.on('data', (data) => {
    console.error('> server error', { error: data.toString() })
  })
  server.on('exit', (code) => {
    server = null
    console.log('> server exited', { code })
  })

  server.stdout.on('data', (data) => {
    logInbound(data.toString())
  })
}

const handleStartServer = () => {
  if (!server) {
    startServer()
  }
}

const handleStopServer = () => {
  if (server) {
    server.kill()
  }
}

const handleRestartServer = () => {
  if (server) {
    server.on('exit', () => {
      startServer()
    })
    server.kill()
  }
}

const handleInitialize = () => {
  return request('initialize')
}

const handleShutdown = () => {
  return request('shutdown')
}

const handleExit = () => {
  return notify('exit')
}

const routes = {
  's': handleStartServer,
  'st': handleStopServer,
  'r': handleRestartServer,
  'i': handleInitialize,
  'sh': handleShutdown,
  [EXIT]: handleExit,
}

process.stdin.on('data', (data) => {
  const command = data.toString().trim()
  return (routes[command] || showHelp)()
})

handleStartServer()
showHelp()
