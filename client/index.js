#!/usr/bin/env node

// This is the client.
// IDE's would talk to this and it would talk to the server (via RPC-JSON).

// In reality, the server should already be running.  This would be
// coordinated by the editor.
const child_process = require('child_process')
const path = require('path')

// Again, use spawn to separate Node relationship.  This could be on a remote
// machine for all we care.
const serverPath = path.resolve(__dirname, '../server/index.js')
let server

const startServer = () => {
  server = child_process.spawn(serverPath)
  process.stdout.write('server started\n')
  server.on('exit', () => {
    server = null
    process.stdout.write('server exited\n')
  })
}

process.stdin.on('data', (data) => {
  switch(data.toString()) {
    case 'start server\n':
      startServer()
      break

    case 'stop server\n':
      server.kill()
      break

    default:
      if (!server) {
        startServer()
      }
      server.stdout.once('data', (data) => {
        process.stdout.write(data)
      })

      // server.stdin.write(`LSP-request-placeholder: ${data}`)
      server.stdin.write(data)
  }
})

console.log('client is ready for commands')
