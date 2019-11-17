#!/usr/bin/env node

// This is the client.

const child_process = require('child_process')
const path = require('path')
const message = require('../message')
const jsonrpc = require('../jsonrpc')

// Again, use spawn to separate Node relationship.  This could be on a remote
// machine for all we care.
const serverPath = path.resolve(__dirname, '../server/index.js')
let serverProcess
let requestId = 0

const EXIT = 'e'
const CANCEL = 'c'

const showHelp = () => console.log(
`
You can issue the following commands:

* (s)tart server - start the LSP server
* (st)op server - stop the server
* (r)estart server

* (i)nitialize
* (sh)utdoown
* (${EXIT})xit
* $/(${CANCEL})ancelRequest
`)

const logMessage = (label) => (message) => {
  const line = '----------------------'
  console.log(`${line}\n${label}\n${line}`)
  console.log(message)
}

const logInbound = logMessage('client <- server')
const logOutbound = logMessage('client -> server')

const sendMessage = (message) => {
  if (serverProcess) {
    serverProcess.stdin.write(message)
    logOutbound(message)
  }
}

const notify = (method, params) => {
  sendMessage(
    message.stringify(jsonrpc.notification(method, params))
  )
}

const request = (method, params) => {
  sendMessage(
    message.stringify(jsonrpc.request(method, params, requestId++))
  )
}

const startServer = () => {
  serverProcess = child_process.spawn(serverPath)
  console.log('> server started')
  serverProcess.stderr.pipe(process.stderr)
  serverProcess.stderr.on('data', (data) => {
    console.error('> server error', { error: data.toString() })
  })
  serverProcess.on('exit', (code) => {
    serverProcess = null
    console.log('> server exited', { code })
  })

  serverProcess.stdout.on('data', (data) => {
    logInbound(data.toString())
  })
}

const client = {
  startServer: () => {
    if (!serverProcess) {
      startServer()
    }
  },

  stopServer: () => {
    if (serverProcess) {
      serverProcess.kill()
    }
  },

  restartServer: () => {
    if (serverProcess) {
      serverProcess.on('exit', () => {
        startServer()
      })
      serverProcess.kill()
    }
  },
}

const server = {
  initialize: () => {
    return request('initialize')
  },

  shutdown: () => {
    return request('shutdown')
  },

  exit: () => {
  return notify('exit')
  },

  cancel: () => {
    return
  }
}

const routes = {
  's': client.startServer,
  'st': client.stopServer,
  'r': client.restartServer,
  'i': server.initialize,
  'sh': server.shutdown,
  [EXIT]: server.exit,
  [CANCEL]: server.cancel,
}

process.stdin.on('data', (data) => {
  const command = data.toString().trim()
  return (routes[command] || showHelp)()
})

client.startServer()
showHelp()
