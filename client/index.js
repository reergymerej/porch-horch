#!/usr/bin/env node

// This is the client.
// IDE's would talk to this and it would talk to the server (via RPC-JSON).

// In reality, the server should already be running.  This would be
// coordinated by the editor.
const child_process = require('child_process')
const path = require('path')
const message = require('../message')
const jsonrpc = require('../jsonrpc')

// Again, use spawn to separate Node relationship.  This could be on a remote
// machine for all we care.
const serverPath = path.resolve(__dirname, '../server/index.js')
let server

const showHelp = () => console.log(
`
  You can issue the following commands:

* (s)tart server - start the LSP server
* (st)op server - stop the server
* (r)estart server
* (i)nitialize
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

process.stdin.on('data', (data) => {
  switch(data.toString().trim()) {
    case 's':
      if (!server) {
        startServer()
      }
      break

    case 'st':
      if (server) {
        server.kill()
      }
      break

    case 'r':
      if (server) {
        server.on('exit', () => {
          startServer()
        })
        server.kill()
      }
      break

    case 'i':
      request('initialize')
      break

    default:
      showHelp()
  }
})

showHelp()
